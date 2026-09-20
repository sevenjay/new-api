# New API 使用 Jev：渠道設定、curl 範例與 TypeSafe 相容性

本文說明如何透過 New API 呼叫 OpenRouter 的 Jev 模型，以及如何驗證前端渠道設定與後端轉送。


## 核心使用方式相同

Jev 的核心操作是提供 `state` 與 `questions`，取得以問題名稱對應的結構化 `answers`。三種問題可以放在同一次請求中，共用同一份 state。[TypeSafe 官方 API 文件](https://docs.typesafe.ai/api)

| 問題類型 | 用途 | 主要回傳欄位 |
| --- | --- | --- |
| `noul` | 判斷敘述是否成立 | `noul`：0～1 的機率 |
| `choice` | 從指定選項中分類 | `choice`、`probabilities`、`confidence` |
| `score` | 依照有順序的評分標準評分 | `score`、`probabilities`、`confidence`、`legend` |

例如 `answers.needs_refund.noul` 為 `0.98`，表示模型給出的「需要退款」機率為 0.98；應用程式自行決定採取動作的門檻。`score` 可以是小數，三個評分等級對應的範圍為 0～2。

這些問題設計與回應處理方式可以沿用 TypeSafe 官方範例。目前 New API 的支援範圍與 SDK 路徑仍有差異，詳見後文。

## 連線設定有以下差異

| 項目 | 直接使用 TypeSafe | 本文的 New API → OpenRouter 設定 |
| --- | --- | --- |
| 呼叫網址 | `https://api.typesafe.ai/v1/systemone` | `https://test-llmgate.airdroid.com/v1/decisions` |
| Bearer 金鑰 | TypeSafe API Key | New API 令牌 |
| 請求的 `model` | `jev-latest` | 渠道設定的別名 `jev-latest` |
| 實際上游模型 | TypeSafe 解析該模型名稱 | 映射為 `typesafe/jev-1.13` |
| 終端使用者扣費 | TypeSafe 帳戶 | New API 的計費設定、分組與額度 |
| 上游金鑰保存位置 | 呼叫端 | New API 渠道設定中的 OpenRouter API Key |

TypeSafe 的原生端點為 `/v1/systemone`；OpenRouter 的 Decisions 端點為 `https://openrouter.ai/api/alpha/decisions`，使用模型 ID `typesafe/jev-1.13`。[TypeSafe API 文件](https://docs.typesafe.ai/api)、[OpenRouter Decisions API 文件](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-questions-and-answers-request)


## curl 範例：透過 New API 呼叫 Jev

先設定站台根網址與 New API 令牌。根網址不包含 `/v1`；令牌需有足夠額度，且其分組與模型限制允許使用此渠道的 `jev-latest`。

```bash
export NEW_API_BASE_URL='https://test-llmgate.airdroid.com'
export NEW_API_TOKEN='sk-你的NewAPI令牌'
```

以下一次驗證 `noul`、`choice`、`score` 三種問題。`-w` 會在 JSON 本文後顯示 HTTP 狀態，方便保留完整錯誤訊息。
建議使用英文，這邊只是範例方便理解。
```bash
curl -sS --max-time 60 \
  "${NEW_API_BASE_URL%/}/v1/decisions" \
  -H "Authorization: Bearer ${NEW_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  -w '\nHTTP %{http_code}\n' \
  --data-raw '{
    "model": "jev-latest",
    "state": {
      "ticket": "客戶表示同一筆訂單被扣款兩次，希望今天完成退款。"
    },
    "questions": {
      "needs_refund": {
        "type": "noul",
        "instructions": "客戶是否要求退款？"
      },
      "department": {
        "type": "choice",
        "instructions": "這張工單應交給哪個部門？",
        "criteria": {
          "billing": "付款、重複扣款與退款",
          "technical": "軟體故障與技術問題",
          "other": "其他服務問題"
        }
      },
      "urgency": {
        "type": "score",
        "instructions": "評估這張工單的處理急迫程度。",
        "criteria": [
          "可以稍後處理",
          "應於近期處理",
          "需要立即處理"
        ]
      }
    }
  }'
```

預期得到 **HTTP 200**，並檢查：

| 回應欄位 | 驗證重點 |
| --- | --- |
| `model` | 上游實際回傳的模型名稱，可能包含版本或日期 |
| `answers.needs_refund.noul` | 0～1 的機率 |
| `answers.department.choice` | `billing`、`technical`、`other` 其中之一 |
| `answers.department.probabilities` | 各部門的機率 |
| `answers.urgency.score` | 0～2 的分數，可以是小數 |
| `answers.urgency.legend` | 分數等級對應的說明 |
| `usage.input_tokens`、`usage.output_tokens` | 上游回傳的 token 用量 |

推論結果與 token 數量可能隨模型版本、請求內容改變，不應以某個固定分數作為通過條件。

## 與 TypeSafe 官方介面的相容性限制

### SDK 的請求路徑

目前 New API 對外提供 `POST /v1/decisions`，沒有提供同等的 `POST /v1/systemone` 路由。

若 TypeSafe SDK 固定呼叫 `/v1/systemone`，只替換 Base URL 無法直接使用。需要調整 SDK 的請求路徑、自訂 HTTP transport，或在服務端增加相容路由。直接使用本文 curl 或 HTTP client 呼叫 `/v1/decisions`，可使用目前支援的格式。

### criteria 的資料型別

TypeSafe 官方允許部分 criteria 描述使用物件或陣列；目前本分支的驗證規則較窄。[TypeSafe 官方 API 文件](https://docs.typesafe.ai/api)

| 欄位 | 本分支支援 |
| --- | --- |
| `state` | 字串、物件、陣列 |
| `questions.*.instructions` | 字串、物件、陣列 |
| `noul.criteria` | 可省略；提供時，`true`／`false` 的描述必須是字串 |
| `choice.criteria` | 非空物件，各選項描述為字串或 `null` |
| `score.criteria` | 至少兩個字串組成的陣列 |

本文範例使用文字描述，符合目前支援的型別。題目數量、模型容量與其他限制仍須符合實際上游的要求。

### 串流與額外欄位

- 不支援串流；`stream: true` 會被拒絕，`stream: false` 會在送往上游前移除。
- 請求會經過結構化解析、模型映射及驗證，未定義的額外請求欄位不會完整透傳。
- 成功回應通過 New API 的答案與用量驗證後，會保留上游 JSON；若回應格式不符合驗證要求，可能回傳 502。
- 錯誤回應可能由 New API 的驗證、路由或計費流程產生，因此錯誤格式與狀態碼不保證與直接使用 TypeSafe 完全相同。
