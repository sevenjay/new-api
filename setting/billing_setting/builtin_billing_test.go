package billing_setting

import (
	"testing"

	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestJevBuiltinBilling(t *testing.T) {
	originalSetting := billingSetting
	originalRatios := ratio_setting.ModelRatio2JSONString()
	originalPrices := ratio_setting.ModelPrice2JSONString()
	t.Cleanup(func() {
		billingSetting = originalSetting
		require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(originalRatios))
		require.NoError(t, ratio_setting.UpdateModelPriceByJSONString(originalPrices))
	})

	cases := []struct {
		name, model, mode, expression, ratios, prices string
		wantMode, wantExpression                     string
	}{
		{name: "latest defaults to token expression", model: "jev-latest", wantMode: BillingModeTieredExpr, wantExpression: `tier("standard", p * 0.042)`},
		{name: "versioned model defaults to token expression", model: "jev-1.13.0", wantMode: BillingModeTieredExpr, wantExpression: `tier("standard", p * 0.042)`},
		{name: "preview defaults to token expression", model: "jev-preview", wantMode: BillingModeTieredExpr, wantExpression: `tier("standard", p * 0.042)`},
		{name: "administrator expression overrides default", model: "jev-latest", expression: `tier("custom", p * 2 + c * 4)`, wantMode: BillingModeTieredExpr, wantExpression: `tier("custom", p * 2 + c * 4)`},
		{name: "explicit ratio mode overrides default", model: "jev-latest", mode: BillingModeRatio, wantMode: BillingModeRatio},
		{name: "configured free ratio overrides default", model: "jev-latest", ratios: `{"jev-latest":0}`, wantMode: BillingModeRatio},
		{name: "configured per-call price overrides default", model: "jev-latest", prices: `{"jev-latest":0.1}`, wantMode: BillingModeRatio},
		{name: "explicit expression mode overrides legacy ratio", model: "jev-latest", mode: BillingModeTieredExpr, ratios: `{"jev-latest":1}`, wantMode: BillingModeTieredExpr, wantExpression: `tier("standard", p * 0.042)`},
		{name: "unrelated models keep ratio billing", model: "custom-model", wantMode: BillingModeRatio},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			billingSetting = BillingSetting{BillingMode: map[string]string{}, BillingExpr: map[string]string{}}
			if tc.mode != "" {
				billingSetting.BillingMode[tc.model] = tc.mode
			}
			if tc.expression != "" {
				billingSetting.BillingExpr[tc.model] = tc.expression
			}
			ratios, prices := tc.ratios, tc.prices
			if ratios == "" {
				ratios = `{}`
			}
			if prices == "" {
				prices = `{}`
			}
			require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(ratios))
			require.NoError(t, ratio_setting.UpdateModelPriceByJSONString(prices))

			assert.Equal(t, tc.wantMode, GetBillingMode(tc.model))
			expression, found := GetBillingExpr(tc.model)
			assert.Equal(t, tc.wantExpression, expression)
			assert.Equal(t, tc.wantExpression != "", found)

			// Pricing sync must advertise the same effective defaults as relay billing.
			syncData := GetPricingSyncData(nil)
			syncedExpressions, ok := syncData[BillingExprField].(map[string]string)
			require.True(t, ok)
			assert.Equal(t, tc.wantExpression, syncedExpressions[tc.model])
			if tc.wantMode == BillingModeTieredExpr {
				syncedModes, ok := syncData[BillingModeField].(map[string]string)
				require.True(t, ok)
				assert.Equal(t, tc.wantMode, syncedModes[tc.model])
			}
		})
	}
}
