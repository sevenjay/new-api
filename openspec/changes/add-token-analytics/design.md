## Context
The current analytics system stores `quota_data` with `token_name` and `model_name`. The dashboard aggregates this by `model_name`. We need to expose the `token_name` dimension.

## Goals
- Provide a dashboard view pivoted on Tokens.
- Allow users to see which Tokens are consuming the most quota.
- Allow users to see usage trends per Token.

## Decisions
- **Reuse `quota_data` table**: The table already has the necessary columns. No schema change needed.
- **Reuse `/api/data` endpoint**: Add a query parameter `group_by` (default `model`) to switch aggregation mode. This avoids code duplication.
- **Frontend Reuse**: Reuse `ChartsPanel` logic/components where possible, but adapted for Token dimension.

## Risks
- **Data Volume**: If there are thousands of tokens, the chart might get crowded.
  - **Mitigation**: Limit Top N tokens in charts (e.g., Top 20) and group others as "Other".
