# TitanCore Hardware B2B Tracker — Frontend

A React + Vite B2B enterprise terminal for supply chain tracking, order processing, inventory monitoring, and staff management with Role-Based Access Control (RBAC).

---

## 1. Backend ↔ Frontend Contract

### Login Endpoint
- **URL**: `/api/auth/login` (Full: `http://localhost:3000/api/auth/login`)
- **HTTP Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "email": "admin@company.com",
  "password": "password"
}
```

#### Successful Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN_STRING>",
    "user": {
      "id": 1,
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@company.com",
      "role": {
        "id": 1,
        "name": "Administrator",
        "slug": "admin"
      }
    },
    "permissions": [
      {
        "id": 1,
        "name": "View Dashboard",
        "slug": "dashboard.view",
        "action": "view"
      }
    ],
    "screens": [
      {
        "id": 1,
        "name": "Dashboard",
        "slug": "dashboard",
        "route": "/dashboard"
      },
      {
        "id": 2,
        "name": "Staff",
        "slug": "staff",
        "route": "/staff"
      },
      {
        "id": 3,
        "name": "Products",
        "slug": "products",
        "route": "/products"
      },
      {
        "id": 4,
        "name": "Inventory",
        "slug": "inventory",
        "route": "/inventory"
      },
      {
        "id": 5,
        "name": "Orders",
        "slug": "orders",
        "route": "/orders"
      },
      {
        "id": 6,
        "name": "Deliveries",
        "slug": "deliveries",
        "route": "/deliveries"
      }
    ]
  }
}
```

#### Error Responses
- **Missing Required Fields (HTTP 400)**:
  ```json
  { "success": false, "message": "Email is required" }
  ```
- **Invalid Credentials (HTTP 401)**:
  ```json
  { "success": false, "message": "Invalid email or password" }
  ```
- **Deactivated Account (HTTP 403)**:
  ```json
  { "success": false, "message": "Your account has been deactivated. Please contact an administrator." }
  ```

---

## 2. Token & Authentication Handling
- The received JWT token is stored in `localStorage.getItem('token')`.
- All subsequent API requests send the token via HTTP header:
  ```http
  Authorization: Bearer <token>
  ```
- Axios request & response interceptors in `src/services/api.js` automatically attach the header and handle token invalidation.

---

## 3. How to Run

### Step 1: Start Backend (Port 3000)
```bash
cd hardware-b2b-tracker-backend
npm run dev
# or
node server.js
```

### Step 2: Start Frontend (Port 5173)
```bash
cd hardware-b2b-tracker-frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Default Seeded Credentials
- **Email**: `admin@company.com`
- **Password**: `password`