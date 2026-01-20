## 1. Backend Implementation
- [ ] 1.1 Update `model/usedata.go` to add `GetAllQuotaDatesByToken` or modify `GetAllQuotaDates` to support grouping by `token_name`.
- [ ] 1.2 Update `controller/usedata.go` to handle `group_by=token` parameter in `GetAllQuotaDates` endpoint.

## 2. Frontend Implementation
- [ ] 2.1 Create `web/src/pages/TokenAnalytics/index.jsx` and `TokenCharts.jsx` (based on Dashboard components).
- [ ] 2.2 Add route `/console/token-analytics` in `web/src/App.js` (or relevant router file).
- [ ] 2.3 Add "Token Analysis" menu item to `web/src/components/layout/SiderBar.jsx`.
- [ ] 2.4 Update `web/src/hooks/dashboard/useDashboardData.js` (or create `useTokenAnalyticsData`) to fetch data with `group_by=token`.
