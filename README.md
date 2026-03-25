# Simple Expense Tracker

Track your income, expenses, and budgets with a clean, event-driven architecture using **NestJS** and **Next.js**.

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Running the Project

```bash
git clone <repository-url>
cd full-stack-task
cp .env.example .env
docker-compose up --build
```

> The `.env` file is required by Docker Compose. Copy it from `.env.example` before starting. The default values work out of the box for local development.

This will start all services:

| Service         | URL                          | Description              |
|-----------------|------------------------------|--------------------------|
| Frontend        | http://localhost:4000         | Next.js application      |
| Backend API     | http://localhost:3000         | NestJS REST API          |
| Swagger Docs    | http://localhost:3000/api/docs| API documentation        |
| pgAdmin         | http://localhost:5050         | Database admin UI        |

### Default Login Credentials

A default user is automatically seeded on first startup:

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@qashio.com` |
| Password | `Admin@123`        |

Use these credentials to log in at http://localhost:4000/login.

> All API endpoints (except login) require authentication. The frontend handles token management automatically after login.

---

## Tech Stack

### Backend
- **Framework**: NestJS 11 with TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 15
- **Event Streaming**: Kafka + EventEmitter
- **Auth**: JWT with refresh token rotation
- **Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript + React 19
- **UI Library**: MUI v7, MUI DataGrid v8, MUI DatePickers v8
- **Data Fetching**: React Query v5
- **State Management**: Zustand v5
- **Validation**: Zod + React Hook Form

---

## Project Structure

```
full-stack-task/
├── qashio-api/                  # NestJS backend
│   └── src/
│       ├── auth/                # JWT authentication + refresh tokens
│       ├── users/               # User entity + seeder
│       ├── categories/          # Category CRUD
│       ├── transactions/        # Transaction CRUD + filtering/pagination
│       ├── budgets/             # Budget management + spending calculation
│       ├── notifications/       # Budget alerts + large expense alerts
│       ├── audit-logs/          # Kafka-powered audit trail
│       └── kafka/               # Kafka producer + consumer
├── qashio-frontend-assignment/  # Next.js frontend
│   └── app/
│       ├── login/               # Authentication page
│       ├── transactions/        # Transaction list + create form
│       ├── categories/          # Category management
│       ├── budgets/             # Budget management with progress bars
│       ├── audit-logs/          # Audit log viewer
│       ├── components/          # Shared UI components
│       ├── hooks/               # React Query + Zustand hooks
│       └── lib/api/             # API client layer
└── docker-compose.yml           # Full infrastructure setup
```

---

## API Endpoints

### Authentication
| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| POST   | /auth/login    | Login (returns JWT)  |
| POST   | /auth/refresh  | Refresh access token |
| POST   | /auth/logout   | Logout               |

### Transactions
| Method | Endpoint             | Description                                    |
|--------|----------------------|------------------------------------------------|
| POST   | /transactions        | Create transaction                             |
| GET    | /transactions        | List with pagination, filtering, sorting       |
| GET    | /transactions/:id    | Get by ID                                      |
| PUT    | /transactions/:id    | Update transaction                             |
| DELETE | /transactions/:id    | Soft delete transaction                        |
| GET    | /transactions/summary| Income/expense/balance summary                 |
| GET    | /transactions/export | Export to CSV                                  |

**Query params for GET /transactions**: `page`, `limit`, `sortBy`, `order`, `category`, `type`, `status`, `startDate`, `endDate`, `search`

### Categories
| Method | Endpoint       | Description       |
|--------|----------------|-------------------|
| POST   | /categories    | Create category   |
| GET    | /categories    | List all          |
| DELETE | /categories/:id| Delete category   |

### Budgets
| Method | Endpoint      | Description                      |
|--------|---------------|----------------------------------|
| POST   | /budgets      | Create budget for a category     |
| GET    | /budgets      | List budgets with current spending|
| PUT    | /budgets/:id  | Update budget                    |
| DELETE | /budgets/:id  | Delete budget                    |

### Notifications
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /notifications            | List recent notifications |
| GET    | /notifications/unread-count| Get unread count         |
| PATCH  | /notifications/read-all   | Mark all as read          |
| PATCH  | /notifications/:id/read   | Mark one as read          |

### Audit Logs
| Method | Endpoint    | Description                     |
|--------|-------------|---------------------------------|
| GET    | /audit-logs | List with filters and pagination|

---

## Features

### Core
- Full CRUD for transactions with server-side pagination, filtering, and sorting
- Category management
- Budget tracking with spending vs. limit visualization
- Event-driven architecture (Kafka + EventEmitter)

### Bonus
- JWT authentication with refresh token rotation
- Notification system (budget exceeded, large expense alerts)
- Kafka-powered audit log trail
- Transaction summary/statistics endpoint
- CSV export
- Rate limiting
- Soft deletes across all entities
- Zod form validation on frontend
- Unit tests for backend services
- Responsive design (mobile + desktop)

---

## Running Tests

```bash
cd qashio-api
npm test
```

---

## Environment Variables

Environment variables are injected via `docker-compose.yml`. See `.env.example` for reference. No manual `.env` file is required to run with Docker Compose.

---

## Infrastructure Services

| Service    | Port  | Purpose                 |
|------------|-------|-------------------------|
| postgres   | 5432  | Primary database        |
| redis      | 6379  | Caching (optional)      |
| kafka      | 9092  | Event streaming         |
| zookeeper  | -     | Required by Kafka       |
| pgadmin    | 5050  | DB admin UI             |

pgAdmin credentials: `admin@admin.com` / `admin`
