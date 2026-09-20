package billing_setting

// Built-in token prices use actual USD per million tokens. Keep new model
// defaults here instead of splitting them across the legacy ratio tables.
var builtinBillingExpr = map[string]string{
	// https://docs.typesafe.ai/models (2026-09-18): input $0.042/M tokens, output free.
	"jev-1.13.0":  `tier("standard", p * 0.042)`,
	"jev-latest":  `tier("standard", p * 0.042)`,
	"jev-preview": `tier("standard", p * 0.042)`,
}
