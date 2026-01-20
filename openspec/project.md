# Project Context

## Purpose
**New API** is a new generation Large Language Model (LLM) gateway and AI asset management system. It is a fork of [One API](https://github.com/songquanpeng/one-api) designed to provide a unified interface for various AI models (OpenAI, Claude, Gemini, etc.) with added features for billing, user management, and high performance.

**Goals:**
- Provide a stable and high-performance API gateway compatible with the OpenAI protocol.
- Manage AI assets, including API keys and model quotas.
- Support multiple payment channels and billing strategies.
- Offer a user-friendly interface for administration and usage.

## Tech Stack
- **Language:** Go (Backend), JavaScript/React (Frontend)
- **Frameworks:**
    - **Backend:** [Gin](https://github.com/gin-gonic/gin) (Web Framework)
    - **Frontend:** React, Tailwind CSS
- **Database:**
    - **ORM:** [GORM](https://gorm.io/)
    - **Supported DBs:** SQLite (default), MySQL, PostgreSQL
- **Caching:** Redis, Memory
- **Infrastructure:** Docker, Docker Compose
- **Key Libraries:**
    - `go-redis/redis` (Redis client)
    - `jwt-go` (Authentication)
    - `viper` (Configuration - implied by similar projects, though `godotenv` is used)
    - `aws-sdk-go-v2` (AWS integration)
    - `stripe-go` (Payments)

## Project Conventions

### Code Style
- **Go (Backend):**
    - Follows standard Go conventions (`gofmt`).
    - **Naming:** PascalCase for exported types/functions, camelCase for internal variables.
    - **JSON Tags:** `snake_case` (e.g., `json:"owned_by"`).
    - **Error Handling:** Explicit error checking; custom error types in `types/error.go`.
- **React (Frontend):**
    - JSX for components.
    - Functional components with Hooks.
    - Tailwind CSS for styling.

### Architecture Patterns
- **Layered Architecture:**
    - **Controller (`controller/`):** Handles HTTP requests, input validation, and response formatting.
    - **Service (`service/`):** Contains business logic, external API calls, and complex operations.
    - **Model (`model/`):** Defines database schemas and data access methods (GORM models).
    - **DTO (`dto/`):** Data Transfer Objects for API request/response structures.
    - **Middleware:** Gin middleware for auth (`auth.go`), CORS, logging.
- **Relay System:**
    - `relay/` package handles routing requests to different model providers (OpenAI, Anthropic, Google, etc.).

### Testing Strategy
- **Integration Tests:** User will test the project manually by himself.

### Git Workflow
- **Branching:** Main/Master branch for stable releases. Feature branches for development.
- **Commits:** Conventional Commits recommended (e.g., `feat:`, `fix:`, `docs:`).

## Domain Context
- **Channels:** Abstraction for upstream model providers (e.g., an OpenAI API key is a channel).
- **Token/Quota:** Currency for model usage.
- **Redemption:** Voucher system for topping up quotas.
- **Relay/Proxy:** The core function of forwarding user requests to the appropriate upstream provider.
- **Billing:** Integration with Stripe, Epay, etc., for user balance management.

## Important Constraints
- **Compatibility:** Must maintain compatibility with OpenAI API formats.
- **Performance:** High throughput and low latency are critical for a gateway.
- **Security:** Strict handling of API keys and sensitive user data (passwords, tokens).

## External Dependencies
- **Model Providers:** OpenAI, Anthropic (Claude), Google (Gemini), Midjourney, Suno, etc.
- **Payment Gateways:** Stripe, Epay, Creem.
- **Auth Providers:** GitHub, Discord, Telegram, LinuxDO (OAuth).
