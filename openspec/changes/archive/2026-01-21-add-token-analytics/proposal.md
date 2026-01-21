# Change: Add Token Analytics Page

## Why
Users need to analyze usage costs, model distribution, trends, and call counts at the **Token** level. The current dashboard aggregates data by Model (across all tokens) or allows filtering by a specific token name, but lacks a dedicated view to compare tokens and analyze their individual performance in aggregate.

## What Changes
- **Backend**: Update `/api/data` to support grouping quota data by `token_name` via a new `group_by` parameter.
- **Frontend**: Add a new "Token Analysis" page (`/console/token-analytics`) to the Console.
- **Frontend**: Add "Token Analysis" to the sidebar menu.
- **Frontend**: Implement charts for Token Consumption Distribution, Trend, and Rankings.
- **Frontend**: Enable drill-down from Token charts to the Dashboard for detailed Model Distribution analysis.

## Impact
- **Affected specs**: `analytics`
- **Affected code**: `controller/usedata.go`, `model/usedata.go`, `web/src/pages/TokenAnalytics`, `web/src/components/layout/SiderBar.jsx`.
