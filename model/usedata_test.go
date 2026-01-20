package model

import (
	"testing"
	"time"

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
		// LOG_DB is SQLite, so Dialector.Name() != "mysql"
		// It should use / which works
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
}
