package service

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/QuantumNous/new-api/setting/system_setting"
)

// WebhookPayload webhook 通知的负载数据
type WebhookPayload struct {
	Type      string        `json:"type"`
	Title     string        `json:"title"`
	Content   string        `json:"content"`
	Values    []interface{} `json:"values,omitempty"`
	Timestamp int64         `json:"timestamp"`
}

const MaxWebhookTemplateBytes = 16 * 1024

var webhookTemplatePlaceholders = []string{
	"{{type}}",
	"{{title}}",
	"{{content}}",
	"{{value}}",
	"{{timestamp}}",
}

// generateSignature 生成 webhook 签名
func generateSignature(secret string, payload []byte) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	return hex.EncodeToString(h.Sum(nil))
}

func webhookContent(data dto.Notify) string {
	content := data.Content
	for _, value := range data.Values {
		content = strings.Replace(content, dto.ContentValueParam, fmt.Sprintf("%v", value), 1)
	}
	return content
}

func marshalWebhookTemplateString(value string) (string, error) {
	encoded, err := common.Marshal(value)
	if err != nil {
		return "", err
	}
	if len(encoded) < 2 {
		return "", fmt.Errorf("failed to encode webhook template value")
	}
	return string(encoded[1 : len(encoded)-1]), nil
}

func renderWebhookPayload(webhookTemplate string, data dto.Notify, timestamp int64) ([]byte, error) {
	content := webhookContent(data)
	if strings.TrimSpace(webhookTemplate) == "" {
		return common.Marshal(WebhookPayload{
			Type:      data.Type,
			Title:     data.Title,
			Content:   content,
			Values:    data.Values,
			Timestamp: timestamp,
		})
	}
	if len(webhookTemplate) > MaxWebhookTemplateBytes {
		return nil, fmt.Errorf("template exceeds %d bytes", MaxWebhookTemplateBytes)
	}

	unsupportedCheck := webhookTemplate
	for _, placeholder := range webhookTemplatePlaceholders {
		unsupportedCheck = strings.ReplaceAll(unsupportedCheck, placeholder, "")
	}
	if strings.Contains(unsupportedCheck, "{{") || strings.Contains(unsupportedCheck, "}}") {
		return nil, fmt.Errorf("template contains an unsupported placeholder")
	}

	typeValue, err := marshalWebhookTemplateString(data.Type)
	if err != nil {
		return nil, fmt.Errorf("failed to encode webhook type: %w", err)
	}
	titleValue, err := marshalWebhookTemplateString(data.Title)
	if err != nil {
		return nil, fmt.Errorf("failed to encode webhook title: %w", err)
	}
	contentValue, err := marshalWebhookTemplateString(content)
	if err != nil {
		return nil, fmt.Errorf("failed to encode webhook content: %w", err)
	}
	firstValue := ""
	if len(data.Values) > 0 {
		firstValue = fmt.Sprintf("%v", data.Values[0])
	}
	valueValue, err := marshalWebhookTemplateString(firstValue)
	if err != nil {
		return nil, fmt.Errorf("failed to encode webhook value: %w", err)
	}

	rendered := strings.NewReplacer(
		"{{type}}", typeValue,
		"{{title}}", titleValue,
		"{{content}}", contentValue,
		"{{value}}", valueValue,
		"{{timestamp}}", fmt.Sprintf("%d", timestamp),
	).Replace(webhookTemplate)
	payloadBytes := []byte(rendered)
	var payload map[string]any
	if err := common.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, fmt.Errorf("template must render to a valid JSON object: %w", err)
	}
	if payload == nil {
		return nil, fmt.Errorf("template must render to a JSON object")
	}
	return payloadBytes, nil
}

func ValidateWebhookTemplate(webhookTemplate string) error {
	if strings.TrimSpace(webhookTemplate) == "" {
		return nil
	}
	_, err := renderWebhookPayload(webhookTemplate, dto.Notify{
		Type:    dto.NotifyTypeQuotaExceed,
		Title:   "Quota warning",
		Content: "Remaining quota: {{value}}",
		Values:  []interface{}{"1.00"},
	}, time.Now().Unix())
	return err
}

// SendWebhookNotify 发送 webhook 通知
func SendWebhookNotify(webhookURL string, secret string, webhookTemplate string, data dto.Notify) error {
	payloadBytes, err := renderWebhookPayload(webhookTemplate, data, time.Now().Unix())
	if err != nil {
		return fmt.Errorf("failed to render webhook payload: %w", err)
	}

	// 创建 HTTP 请求
	var req *http.Request
	var resp *http.Response

	if system_setting.EnableWorker() {
		// 构建worker请求数据
		workerReq := &WorkerRequest{
			URL:    webhookURL,
			Key:    system_setting.WorkerValidKey,
			Method: http.MethodPost,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: payloadBytes,
		}

		// 如果有secret，添加签名到headers
		if secret != "" {
			signature := generateSignature(secret, payloadBytes)
			workerReq.Headers["X-Webhook-Signature"] = signature
			workerReq.Headers["Authorization"] = "Bearer " + secret
		}

		resp, err = DoWorkerRequest(workerReq)
		if err != nil {
			return fmt.Errorf("failed to send webhook request through worker: %v", err)
		}
		defer resp.Body.Close()

		// 检查响应状态
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return fmt.Errorf("webhook request failed with status code: %d", resp.StatusCode)
		}
	} else {
		// SSRF防护：验证Webhook URL（非Worker模式）
		if err := ValidateSSRFProtectedFetchURL(webhookURL); err != nil {
			return fmt.Errorf("request reject: %v", err)
		}

		req, err = http.NewRequest(http.MethodPost, webhookURL, bytes.NewBuffer(payloadBytes))
		if err != nil {
			return fmt.Errorf("failed to create webhook request: %v", err)
		}

		// 设置请求头
		req.Header.Set("Content-Type", "application/json")

		// 如果有 secret，生成签名
		if secret != "" {
			signature := generateSignature(secret, payloadBytes)
			req.Header.Set("X-Webhook-Signature", signature)
		}

		// 发送请求
		client := GetSSRFProtectedHTTPClient()
		resp, err = client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to send webhook request: %v", err)
		}
		defer resp.Body.Close()

		// 检查响应状态
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return fmt.Errorf("webhook request failed with status code: %d", resp.StatusCode)
		}
	}

	return nil
}
