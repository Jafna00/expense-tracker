# Expense Tracker

A small full-stack expense tracker built with the MERN stack and Tailwind CSS. Add, edit and delete expenses, browse them in a filterable, paginated table, and see a monthly spending summary on a dashboard. No authentication; data is stored in a local MongoDB.

## Features

- **Dashboard**: monthly total, transaction count, top category, per-category breakdown (amount, percentage, progress bar), recent 5 expenses, month picker with prev/next
- **Expenses page**: table with date, title, category, amount and note, sorted most recent first, with server-side pagination (10 per page)
- **Add / edit**: modal form with title, amount, category, date (defaults to today) and optional note
- **Delete**: with a confirmation dialog
- **Filters**: title search (debounced, case-insensitive, partial match), category, date range (from/to, inclusive)
- **Design**: glassmorphism (frosted translucent panels over a gradient background)

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite), React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express 4, Mongoose 8 (ES modules) |
| Database | MongoDB (local) |

## Project structure

```
demo/
├── server/
│   ├── config/db.js                  # MongoDB connection
│   ├── controllers/expenseController.js
│   ├── middleware/                   # errorHandler.js (404 + error), validateId.js
│   ├── models/Expense.js
│   ├── routes/expenseRoutes.js
│   ├── app.js                        # Express app (middleware, routes)
│   ├── server.js                     # Entry point (env, DB connect, listen)
│   └── .env
└── client/
    └── src/
        ├── api/expenseApi.js         # Axios wrapper
        ├── components/               # Layout, Modal, ExpenseForm, ExpenseTable, Filters, Pagination, ...
        ├── hooks/                    # useCategories, useDebounce
        ├── pages/                    # Dashboard, Expenses
        └── utils/format.js           # currency/date helpers, category colours
```

## Running locally

### Prerequisites

- Node.js 18+
- MongoDB running locally (default port 27017)

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev     # nodemon
# or: npm start
```

Expected output: `MongoDB connected: ...` then `Server running on http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. If the API is not on `http://localhost:5000`, set `VITE_API_URL=http://your-host/api` in `client/.env`. If Vite runs on a different port, update `CLIENT_URL` in `server/.env` (otherwise CORS blocks requests).

## API

Base URL: `/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/expenses` | Create an expense (`date` defaults to today if omitted) |
| GET | `/expenses` | Paginated list, newest first. Query: `category`, `from`, `to` (YYYY-MM-DD), `title`, `page` (default 1), `limit` (default 10, max 100) |
| GET | `/expenses/:id` | Get one |
| PUT | `/expenses/:id` | Update |
| DELETE | `/expenses/:id` | Delete |
| GET | `/expenses/summary?month=YYYY-MM` | Total, count and per-category breakdown (defaults to current month) |
| GET | `/expenses/categories` | Allowed categories |

Expense shape: `{ title, amount, category, date, note }` plus `_id`, `createdAt`, `updatedAt`. Categories: Food, Transport, Shopping, Bills, Entertainment, Health, Other.

The list response also includes `pagination` (`page`, `limit`, `total`, `totalPages`) and `totalAmount` (the sum of all expenses matching the filters, not just the current page).

Errors return `{ success: false, message }` with 400 (validation, bad id, bad date/month), 404 (not found) or 500.

## Stack choices and trade-offs

- **Vite over CRA**: faster dev server and builds; CRA is deprecated. Trade-off: env vars use `import.meta.env.VITE_*`.
- **Plain Axios + `useEffect` over React Query / Redux**: the app has two pages and a handful of requests, so a data-fetching library or global store would be more machinery than benefit. Trade-off: no caching, so every page visit refetches, and refetch-after-mutation is handled manually with a `refreshKey`.
- **Filtering and sorting on the server**: keeps the client simple and lets MongoDB use its indexes (`date`, `category`). Trade-off: every filter change is a network request (title search is debounced to limit this).
- **Offset pagination (`skip`/`limit`) with a `_id` tiebreaker in the sort**: simple, supports jumping to any page, and the tiebreaker stops expenses with the same date from repeating or disappearing between pages. Trade-off: `skip` gets slower on very deep pages, and a cursor-based approach would scale better.
- **Summary computed with a MongoDB aggregation**: totals stay correct regardless of how many expenses exist and the client never needs the full dataset. Trade-off: one extra endpoint.
- **Mongoose enum for categories + `/categories` endpoint**: one source of truth that the form and filter dropdowns read from. Trade-off: categories are fixed in code; user-defined categories would need their own collection.
- **Plain CSS classes for glass styling (`.glass`, `.btn`, ...) instead of `@apply`**: works identically on Tailwind v3 and v4. Trade-off: the design tokens live partly outside Tailwind utilities.
- **ES modules + a small `asyncHandler` wrapper**: modern syntax; the wrapper makes async errors reach the error middleware on Express 4.
- **Hand-rolled modal and form validation**: no extra dependencies. Trade-off: no focus trap in the modal and validation is basic (the server is the source of truth).
- **Dates stored as UTC midnight**: the form sends `YYYY-MM-DD`, which Mongo stores as UTC midnight, so filters and monthly summaries are consistent and don't drift between timezones. Trade-off: see known rough edges.

## What's done

- Full CRUD for expenses with server-side validation (required fields, amount > 0, enum category, max lengths)
- Filters, sorting, monthly summary and dashboard as listed above
- Server-side pagination with page numbers, filter-aware totals, and automatic page correction after deletes
- Loading, empty and error states on both pages
- Race-condition protection on fetches (stale responses are ignored)
- Delete confirmation, modal closes on Esc/backdrop click

## Known rough edges

- **Offset-based pagination**: fine at this scale, but `skip` slows down on very deep pages. The page size is fixed at 10 in `Expenses.jsx` (`PAGE_SIZE`), with no per-page selector.
- **Floating-point money**: amounts are stored as JS numbers (doubles). Totals are rounded to 2 decimals in the summary, but a production app should store integer minor units (paise/cents).
- **Currency is hard-coded to INR** (`en-IN` formatting) in `utils/format.js`.
- **Month picker can't go past the current month**, so future-dated expenses appear in the list but not in a future month's summary.
- **Title search is an unindexed regex scan**: fine at small scale.
- **Hard delete only**, no undo or soft delete.
- **Single allowed CORS origin** (`CLIENT_URL`); no rate limiting, helmet or request-size tuning, since this is a local-only app with no auth.
- The server exits if MongoDB is not reachable at startup.
