package controller

import (
	"net/http"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPublicLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("p", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	logType, _ := strconv.Atoi(c.DefaultQuery("type", "0"))
	startTimestamp, _ := strconv.ParseInt(c.DefaultQuery("start_timestamp", "0"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.DefaultQuery("end_timestamp", "0"), 10, 64)
	tokenName := c.DefaultQuery("token_name", "")
	modelName := c.DefaultQuery("model_name", "")
	group := c.DefaultQuery("group", "")

	// For public logs, we don't filter by username or channel
	username := ""
	channel := ""

	logs, err := model.GetAllLogs(username, tokenName, modelName, channel, group, logType, startTimestamp, endTimestamp, page, pageSize)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"page":      page,
			"page_size": pageSize,
			"total":     logs.Total,
			"items":     logs.Items,
		},
	})
}

func GetPublicLogStat(c *gin.Context) {
	logType, _ := strconv.Atoi(c.DefaultQuery("type", "0"))
	startTimestamp, _ := strconv.ParseInt(c.DefaultQuery("start_timestamp", "0"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.DefaultQuery("end_timestamp", "0"), 10, 64)
	tokenName := c.DefaultQuery("token_name", "")
	modelName := c.DefaultQuery("model_name", "")
	group := c.DefaultQuery("group", "")

	// For public logs, we don't filter by username or channel
	username := ""
	channel := ""

	quota, tokens, rpm, tpm, err := model.SumUsedQuota(username, tokenName, modelName, channel, group, logType, startTimestamp, endTimestamp)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"quota":  quota,
			"token":  tokens,
			"rpm":    rpm,
			"tpm":    tpm,
		},
	})
}
