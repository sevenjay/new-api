package operation_setting

import (
	"encoding/json"
	"github.com/QuantumNous/new-api/common"
)

type headerNavModules struct {
	Pricing json.RawMessage `json:"pricing"`
}

type pricingModule struct {
	Enabled     bool `json:"enabled"`
	RequireAuth bool `json:"requireAuth"`
}

// IsModelMarketplaceRequireAuth reports whether the model marketplace (pricing) page
// should enforce login requirements based on the stored HeaderNavModules option.
func IsModelMarketplaceRequireAuth() bool {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()

	raw, ok := common.OptionMap["HeaderNavModules"]
	if !ok || raw == "" {
		return false
	}

	var modules headerNavModules
	if err := json.Unmarshal([]byte(raw), &modules); err != nil {
		return false
	}

	if len(modules.Pricing) == 0 {
		return false
	}

	// Handle legacy boolean configuration where pricing was either on or off.
	var legacy bool
	if err := json.Unmarshal(modules.Pricing, &legacy); err == nil {
		return false
	}

	var pricing pricingModule
	if err := json.Unmarshal(modules.Pricing, &pricing); err != nil {
		return false
	}

	return pricing.RequireAuth
}
