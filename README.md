# ⚡ TitanCore Hardware B2B Tracker — Frontend

A production-ready React + Vite B2B enterprise terminal for hardware manufacturing and supply chain management. Features end-to-end Role-Based Access Control (RBAC), real-time inventory tracking, order management, production schedules, staff management, and system auditing.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Quick Start Guide](#-quick-start-guide)
3. [Environment Configuration](#-environment-configuration)
4. [Backend Integration & Contract](#-backend-integration--contract)
5. [Database & Seed Data Expectations](#-database--seed-data-expectations)
6. [Screen Modules & Routing](#-screen-modules--routing)
7. [Authentication & RBAC Architecture](#-authentication--rbac-architecture)
8. [Troubleshooting & Common Issues](#-troubleshooting--common-issues)
9. [Available Scripts](#-available-scripts)

---

## ⚙️ Prerequisites

Before running the frontend, ensure the following are installed and running:
- **Node.js**: `v18.0.0` or higher (`v20.x` recommended)
- **npm**: `v9.x` or higher (or `pnpm` / `yarn`)
- **Backend Service**: TitanCore Express backend running on `http://localhost:3000` (or configured via `.env`).

---

## 🚀 Quick Start Guide

### 1. Clone & Navigate
```bash
git clone git@github.com:Thanush-74/hardware-b2b-tracker-frontend.git
cd hardware-b2b-tracker-frontend
```

### 2. Install Dependencies
```bash
npm install
```
> **Note**: `node_modules/` is excluded from the repository. Running `npm install` installs all required packages (Material UI, Emotion, Axios, React Router, etc.).

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Windows PowerShell: `Copy-Item .env.example .env`)*

If your backend is running on `http://localhost:3000`, no changes are needed.

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🌐 Environment Configuration

Configuration is managed via Vite environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the backend API (without trailing slash) |

If your backend runs on a different port (e.g. `5000`) or remote server:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🔌 Backend Integration & Contract

The frontend interacts with the backend REST API via Axios (`src/services/api.js`).

### 1. Authentication
- **Login Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@company.com",
    "password": "password"
  }
  ```
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "first_name": "Admin",
        "last_name": "User",
        "email": "admin@company.com",
        "role": { "id": 1, "name": "Administrator", "slug": "admin" }
      },
      "screens": [
        { "id": 1, "name": "Dashboard", "slug": "dashboard", "route": "/dashboard" },
        { "id": 2, "name": "Staff", "slug": "staff", "route": "/staff" },
        { "id": 3, "name": "Products", "slug": "products", "route": "/products" },
        { "id": 4, "name": "Inventory", "slug": "inventory", "route": "/inventory" },
        { "id": 5, "name": "Orders", "slug": "orders", "route": "/orders" },
        { "id": 6, "name": "Deliveries", "slug": "deliveries", "route": "/deliveries" },
        { "id": 7, "name": "Cart", "slug": "cart", "route": "/cart" },
        { "id": 8, "name": "Production", "slug": "production", "route": "/production" },
        { "id": 9, "name": "Returns", "slug": "returns", "route": "/returns" },
        { "id": 10, "name": "Manufacturing", "slug": "manufacturing", "route": "/manufacturing" },
        { "id": 11, "name": "Expenses", "slug": "expenses", "route": "/expenses" },
        { "id": 12, "name": "Inspection", "slug": "inspection", "route": "/inspection" }
      ],
      "permissions": [...]
    }
  }
  ```

### 2. User Screen Refresh
- **Endpoint**: `GET /api/auth/screens`
- Re-fetches the active user's assigned screens dynamically whenever permissions change.

### 3. API Endpoints Used by Modules

| Module | Endpoints Used |
| :--- | :--- |
| **Auth** | `POST /api/auth/login`, `GET /api/auth/screens` |
| **Roles & Permissions** | `GET /api/roles`, `POST /api/roles`, `PUT /api/roles/:id`, `DELETE /api/roles/:id` |
| **Screens** | `GET /api/screens` |
| **Staff** | `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/:id`, `DELETE /api/staff/:id` |
| **Products** | `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` |
| **Inventory** | `GET /api/inventory`, `POST /api/inventory`, `PUT /api/inventory/:id`, `DELETE /api/inventory/:id` |
| **Orders** | `GET /api/orders`, `POST /api/orders`, `PUT /api/orders/:id`, `DELETE /api/orders/:id` |
| **Deliveries** | `GET /api/deliveries`, `POST /api/deliveries`, `PUT /api/deliveries/:id`, `DELETE /api/deliveries/:id` |
| **Cart** | `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:id`, `DELETE /api/cart/:id` |
| **Production** | `GET /api/production`, `POST /api/production`, `PUT /api/production/:id`, `DELETE /api/production/:id` |
| **Returns** | `GET /api/returns`, `POST /api/returns`, `PUT /api/returns/:id`, `DELETE /api/returns/:id` |
| **Manufacturing** | `GET /api/manufacturing`, `POST /api/manufacturing`, `PUT /api/manufacturing/:id`, `DELETE /api/manufacturing/:id` |
| **Expenses** | `GET /api/expenses`, `POST /api/expenses`, `PUT /api/expenses/:id`, `DELETE /api/expenses/:id` |
| **Inspection** | `GET /api/inspection`, `POST /api/inspection`, `PUT /api/inspection/:id`, `DELETE /api/inspection/:id` |

---

## 🗄️ Database & Seed Data Expectations

For the frontend to display all screens and data correctly, the backend database must have run seed scripts.

### 1. Default Admin Credentials
- **Email**: `admin@company.com`
- **Password**: `password`
- *(Quick-fill chip is available on the login page for convenience)*

### 2. Screens Table Seeding
Ensure the backend `screens` table includes the following slugs:
- `dashboard`
- `staff`
- `products`
- `inventory`
- `orders`
- `deliveries`
- `cart`
- `production`
- `returns`
- `manufacturing`
- `expenses`
- `inspection`
- `roles` *(reserved for admin role management)*

### 3. Role-Screen Mapping
The administrator role (`admin`) should have entries in `role_screens` for all the above screens so the full sidebar navigation appears.

---

## 🖥️ Screen Modules & Routing

| Path | Component | Description |
| :--- | :--- | :--- |
| `/login` | `LoginPage.jsx` | Authentication with seeded credential quick-fill |
| `/dashboard` | `DashboardPage.jsx` | High-level metrics, quick navigation cards |
| `/staff` | `StaffManagementPage.jsx` | Full CRUD for staff members & role assignments |
| `/products` | `ProductManagementPage.jsx` | Product catalog, pricing, category management |
| `/inventory` | `InventoryManagementPage.jsx` | Stock levels, reorder alerts, warehouse metrics |
| `/orders` | `OrderManagementPage.jsx` | Customer order lifecycle tracking |
| `/deliveries` | `DeliveryManagementPage.jsx` | Dispatch and shipment logistics |
| `/cart` | `CartManagementPage.jsx` | Procurement and cart orders |
| `/production` | `ProductionManagementPage.jsx` | Factory production schedules and runs |
| `/returns` | `ReturnsManagementPage.jsx` | RMA and customer returned stock inspection |
| `/manufacturing` | `ManufacturingManagementPage.jsx` | Assembly and machine operations |
| `/expenses` | `ExpenseManagementPage.jsx` | Operational expenses and ledger entries |
| `/inspection` | `InspectionManagementPage.jsx` | QA inspection checkpoints and compliance |
| `/roles` | `RoleManagementPage.jsx` | Admin RBAC role creation and screen assignments |

---

## 🛡️ Authentication & RBAC Architecture

1. **Token Persistence**: JWT is saved in `localStorage.getItem('token')`.
2. **Auto-Header**: Axios request interceptor attaches `Authorization: Bearer <token>` to all calls.
3. **Session Expiry**: 401 Unauthorized responses trigger automatic cleanup and redirect to `/login`.
4. **Dynamic Sidebar**: Sidebar menu items in `AppLayout.jsx` are rendered strictly based on the `screens` array returned by `/api/auth/screens`.
5. **Route Guards**:
   - `ProtectedRoute`: Requires valid JWT session.
   - `ScreenRoute`: Verifies the user has access to that specific module slug; redirects to `/access-denied` if unauthorized.
   - `AdminRoute`: Protects `/roles` exclusively for admin users.
6. **Error Boundary**: `<ErrorBoundary>` catches uncaught render exceptions, rendering an emergency recovery card rather than a blank white screen.

---

## 🛠️ Troubleshooting & Common Issues

### 1. CORS Error (`Access-Control-Allow-Origin`)
- **Symptom**: Network error on login or API calls.
- **Fix**: In your backend `server.js` or `app.js`, ensure `cors()` allows `http://localhost:5173`:
  ```javascript
  const cors = require('cors');
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  ```

### 2. Sidebar is Empty After Login
- **Symptom**: Successfully logged in, but sidebar shows no links.
- **Fix**: Check your backend database `role_screens` table. The logged-in user's role must be linked to screen IDs in the `screens` table.

### 3. Blank White Page on Route
- **Symptom**: White screen when clicking a navigation link.
- **Fix**: The frontend now includes an `ErrorBoundary` that displays exact error details. Check the browser console (`F12`) for any backend format mismatch.

### 4. Backend on Different Port / Machine
- Create or update `.env` in the `frontend/` folder:
  ```env
  VITE_API_BASE_URL=http://<backend-ip>:<backend-port>
  ```
  Restart the Vite dev server (`npm run dev`).

---

## 📦 Available Scripts

```bash
# Start development server with Hot Module Replacement (HMR)
npm run dev

# Build production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```