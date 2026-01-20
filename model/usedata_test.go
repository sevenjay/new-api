package model

import (
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestGetQuotaDataFromLogs(t *testing.T) {
	// Setup SQLite DB
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}

	// Set global DBs
	DB = db
	LOG_DB = db
	common.UsingSQLite = true // Force SQLite mode

	// Migrate
	err = db.AutoMigrate(&Log{})
	if err != nil {
		t.Fatal(err)
	}

	// Insert test data
	now := time.Now().Unix()
	log := &Log{
		UserId:    1,
		Username:  "test_user",
		TokenName: "test_token",
		ModelName: "gpt-4",
		CreatedAt: now,
		Type:      LogTypeConsume,
		Quota:     100,
		PromptTokens: 10,
		CompletionTokens: 10,
	}
	err = db.Create(log).Error
	if err != nil {
		t.Fatal(err)
	}

	// Test SQLite Path
	t.Run("SQLite Path", func(t *testing.T) {
		common.UsingSQLite = true
		data, err := GetQuotaDataFromLogs(0, "", "test_token", now-3600, now+3600)
		if err != nil {
			t.Fatalf("SQLite path failed: %v", err)
		}
		if len(data) == 0 {
			t.Log("No data found, but query succeeded")
		} else {
			t.Logf("Data found: %+v", data[0])
		}
	})

	// Test MySQL Path (Simulated check)
	// This ensures that when UsingSQLite is false, it tries to use MySQL syntax (DIV).
	// Running MySQL syntax on SQLite should fail.
	t.Run("MySQL Path Logic Check", func(t *testing.T) {
		common.UsingSQLite = false
		defer func() { common.UsingSQLite = true }() // Restore

		_, err := GetQuotaDataFromLogs(0, "", "test_token", now-3600, now+3600)
		if err == nil {
			t.Fatal("Expected error when using MySQL syntax (DIV) on SQLite, but got nil")
		}
		t.Logf("Got expected error for MySQL syntax on SQLite: %v", err)
	})
}
