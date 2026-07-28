# E-Commerce API

A production-grade RESTful e-commerce backend built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**. Features JWT-based authentication with session management, a layered architecture, and comprehensive error handling.

---

## Architecture

```
src/
├── config/          Environment configuration
├── controllers/     HTTP request handlers
├── errors/          Custom error classes & factory
├── infrastructure/  Database client & file-based logger
├── middleware/      Auth, context, logging, error handling
├── repositories/    Data access layer (Prisma queries)
├── routes/          Express route definitions
├── services/        Business logic layer
├── types/           TypeScript type declarations
├── utils/           Validation, hashing, response helpers
├── app.ts           Express app factory
├── container.ts     Dependency injection root
└── server.ts        HTTP server entry point
```

**Patterns:** Repository pattern for data access, Service layer for business logic, Dependency injection via a central container, Middleware pipeline for cross-cutting concerns.

---

## Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Runtime      | Node.js (TypeScript 6)                 |
| Framework    | Express 5                              |
| Database     | PostgreSQL (via Prisma ORM)            |
| Auth         | JWT + bcrypt + session token tracking  |
| Logging      | Structured JSON file logging           |
| Build        | tsc (TypeScript compiler)              |
| Dev Runner   | tsx (watch mode)                       |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL instance (or Prisma Postgres)

### Installation

```bash
git clone <repository-url>
cd e-commerce-project
npm install
```

### Environment Variables

Create a `.env` file (already provided with defaults):

| Variable           | Description                | Default       |
| ------------------ | -------------------------- | ------------- |
| `PORT`             | Server port                | `3000`        |
| `DATABASE_URL`     | PostgreSQL connection URI  | *(required)*  |
| `JWT_SECRET`       | Token signing secret       | *(required)*  |
| `JWT_EXPIRES_IN`   | Token expiry duration      | `7d`          |
| `SESSION_TTL_DAYS` | Session time-to-live (days)| `7`           |
| `NODE_ENV`         | Environment mode           | `development` |
| `LOG_DIR`          | Log file directory         | `./logs`      |

### Database Setup

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Apply migrations
```

### Development

```bash
npm run dev
```

Starts the server with hot-reload at `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

---

## API Reference

### Health

| Method | Path       | Description       | Auth |
| ------ | ---------- | ----------------- | ---- |
| GET    | `/health`  | Server health     | -    |

### Authentication (`/api/auth`)

| Method | Path             | Description                          | Auth     |
| ------ | ---------------- | ------------------------------------ | -------- |
| POST   | `/api/auth/register` | Create a new user account        | -        |
| POST   | `/api/auth/login`    | Authenticate and receive a JWT   | -        |
| POST   | `/api/auth/logout`   | Revoke current session           | Required |
| POST   | `/api/auth/logout-all`| Revoke all user sessions         | Required |
| GET    | `/api/auth/me`       | Get authenticated user profile   | Required |

### Products (`/api/products`)

| Method | Path                      | Description                    | Auth          |
| ------ | ------------------------- | ------------------------------ | ------------- |
| GET    | `/api/products`           | List products (paginated)      | -             |
| GET    | `/api/products/categories`| List distinct categories       | -             |
| GET    | `/api/products/:id`       | Get product by ID              | -             |
| POST   | `/api/products`           | Create a product               | Admin         |
| PATCH  | `/api/products/:id`       | Update a product               | Admin         |
| DELETE | `/api/products/:id`       | Delete a product               | Admin         |

**Query parameters for `GET /api/products`:**

| Param      | Type   | Default | Description                              |
| ---------- | ------ | ------- | ---------------------------------------- |
| `page`     | number | 1       | Page number (max 500)                    |
| `limit`    | number | 12      | Items per page (max 100)                 |
| `category` | string | -       | Filter by category                       |
| `search`   | string | -       | Search name, description, and category   |
| `sortBy`   | string | `name`  | Sort field (`name`, `price`, `createdAt`)|
| `sortOrder`| string | `asc`   | Sort direction (`asc`, `desc`)           |

### Cart (`/api/cart`)

All routes require authentication.

| Method | Path                  | Description                     |
| ------ | --------------------- | ------------------------------- |
| GET    | `/api/cart`           | List cart items with summary    |
| POST   | `/api/cart`           | Add product to cart             |
| PUT    | `/api/cart/:productId`| Update item quantity            |
| DELETE | `/api/cart/:productId`| Remove item from cart           |
| DELETE | `/api/cart`           | Clear entire cart               |

### Favorites (`/api/favorites`)

All routes require authentication.

| Method | Path                       | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/favorites`           | List favorite products   |
| POST   | `/api/favorites/:productId`| Add product to favorites |
| DELETE | `/api/favorites/:productId`| Remove from favorites    |

### Orders (`/api/orders`)

All routes require authentication. Admins can view all orders.

| Method | Path                     | Description                           |
| ------ | ------------------------ | ------------------------------------- |
| GET    | `/api/orders`            | List user's orders (all if admin)     |
| GET    | `/api/orders/:id`        | Get order details                     |
| POST   | `/api/orders`            | Create order (from cart or items)     |
| PATCH  | `/api/orders/:id/status` | Update order status (admin only)      |

### Contact (`/api/contact`)

| Method | Path               | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/api/contact`     | Submit a contact form|

---

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

The API uses **JWT tokens** combined with **server-side session tracking**. Tokens are verified on every request, and the corresponding session is checked for validity (not expired, not revoked). This allows full session revocation (logout-all) without waiting for token expiry.

---

## Error Handling

Errors follow a consistent JSON envelope:

```json
{
  "success": false,
  "message": "Resource not found",
  "errors": null
}
```

### HTTP Status Codes

| Code | Description                  |
| ---- | ---------------------------- |
| 200  | Success                      |
| 201  | Created                      |
| 400  | Bad request / validation     |
| 401  | Unauthorized                 |
| 403  | Forbidden                    |
| 404  | Not found                    |
| 409  | Conflict (e.g. duplicate)    |
| 500  | Internal server error        |

Prisma errors (`P2002` unique constraint, `P2025` not found) are automatically mapped to appropriate HTTP responses.

---

## Success Response Format

All successful responses follow this envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated endpoints include pagination metadata:

```json
{
  "success": true,
  "data": {
    "products": [ ... ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 12,
      "pages": 5
    }
  }
}
```

---

## Scripts

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Start dev server with hot-reload  |
| `npm run build`         | Compile TypeScript to `dist/`     |
| `npm start`             | Run compiled production server    |
| `npm run typecheck`     | Type-check without emitting       |
| `npm test`              | Run typecheck (test placeholder)  |
| `npm run prisma:generate` | Generate Prisma client         |
| `npm run prisma:migrate`  | Run database migrations        |

---

## Database Schema

Six models: **User**, **Session**, **Product**, **Cart**, **Favorite**, **Order** (with **OrderItem**), and **Contact**.

- Users have a `USER` or `ADMIN` role
- Cart and Favorite use composite unique constraints on `(userId, productId)`
- Orders store items as a separate `OrderItem` relation with price snapshots
- Sessions track token hashes for revocation capability
- Stock levels are decremented atomically within transactions on order creation

---
