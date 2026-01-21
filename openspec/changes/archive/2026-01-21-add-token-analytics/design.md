## Context
The current analytics system uses a `quota_data` table aggregated by `model_name` and `username`. It does *not* store `token_name`. To analyze usage by Token, we must aggregate data from the `logs` table or modify `quota_data`.
Given the requirement for historical analysis, we will query the `logs` table directly for Token-based aggregation, similar to how filtering by `token_name` currently works.

## Goals
- Provide a dashboard view pivoted on Tokens.
- Allow users to see which Tokens are consuming the most quota.
- Allow users to see usage trends per Token.
- Enable drill-down to see Model Distribution for a specific Token.

## Decisions
- **Query `logs` table**: Since `quota_data` lacks `token_name`, we will query the `logs` table and group by `token_name`. This ensures historical data is available immediately without schema migration.
- **Reuse `/api/data` endpoint**: Add a query parameter `group_by` (default `model`) to switch aggregation mode.
- **Frontend Drill-down**: Clicking a token in the charts will navigate to the main Dashboard filtered by that token to show detailed Model Distribution.

## Risks
- **Performance**: Aggregating the `logs` table for all tokens might be slower than querying `quota_data`.
  - **Mitigation**: Add appropriate indexes on `logs` table if missing. Limit the default time range if necessary.
