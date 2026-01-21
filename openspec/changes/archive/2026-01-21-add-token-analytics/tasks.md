## 1. Backend Implementation
- [x] 1.1 Update `model/usedata.go` to add `GetAllQuotaDatesByToken` (querying `logs` table grouped by `token_name`).
- [x] 1.2 Update `controller/usedata.go` to handle `group_by=token` parameter in `GetAllQuotaDates` endpoint.

## 2. Frontend Implementation
- [x] 2.1 Create `web/src/pages/TokenAnalytics/index.jsx` and `TokenCharts.jsx` (based on Dashboard components).
- [x] 2.2 Implement "Drill-down" click handler in charts to navigate to `/dashboard?token_name={token}`.
- [x] 2.3 Add route `/console/token-analytics` in `web/src/App.js` (or relevant router file).
- [x] 2.4 Add "Token Analysis" menu item to `web/src/components/layout/SiderBar.jsx`.
- [x] 2.5 Update `web/src/hooks/dashboard/useDashboardData.js` (or create `useTokenAnalyticsData`) to fetch data with `group_by=token`.
