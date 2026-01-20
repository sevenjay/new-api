## ADDED Requirements
### Requirement: Token Analytics Page
The system SHALL provide a "Token Analysis" page in the Console to analyze usage statistics per Access Token.

#### Scenario: Access Token Analytics
- **WHEN** the user clicks "Token Analysis" in the sidebar
- **THEN** the system navigates to the Token Analytics page (`/console/token-analytics`).

### Requirement: Token Usage Charts
The Token Analytics page SHALL display charts analyzing token usage.

#### Scenario: Token Consumption Distribution
- **WHEN** the user views the Token Analytics page
- **THEN** a Pie Chart displays the distribution of Quota Consumption by Token (e.g., which tokens used the most).

#### Scenario: Token Usage Trend
- **WHEN** the user views the Token Analytics page
- **THEN** a Line Chart displays the usage trend (Request Count or Quota) over time, broken down by Token.

#### Scenario: Token Call Count Ranking
- **WHEN** the user views the Token Analytics page
- **THEN** a Bar Chart displays the ranking of Tokens by Call Count (highest to lowest).

### Requirement: Token Data Aggregation
The backend SHALL support aggregating usage data by Token.

#### Scenario: Fetch Data by Token
- **WHEN** the frontend requests analytics data with `group_by=token`
- **THEN** the backend returns usage statistics grouped by Token Name.
