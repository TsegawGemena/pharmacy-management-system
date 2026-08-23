# Gammo Pharmacy — Project & Backend Documentation

Documentation for the **Gammo Pharmacy Clinical Management System** frontend, and a practical guide for building the backend it needs.

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| **Product name** | Gammo Pharmacy — Clinical Management |
| **Organization** | Gamo Development Association (ጋሞ ልማት ማህበር) |
| **Purpose** | Manage pharmacy operations: products, inventory (batches/expiry), suppliers, purchase orders, POS sales, invoices, reports, staff profile & attendance |
| **Locale** | Ethiopia — currency **ETB**, payments include **Telebirr**, phone format `+251`, VAT **15%** |
| **Repo type** | Frontend only (no backend in this repository) |

### Tech stack (frontend)

| Layer | Technology |
|-------|------------|
| Framework | Next.js **16.3** (App Router) |
| UI | React **19**, TypeScript **5**, Tailwind CSS **v4** |
| Icons | lucide-react |
| HTTP | Native `fetch` (no axios) |
| State | Local `useState` / `useMemo` only (no Redux / React Query) |
| Auth storage | `localStorage` (`auth_token`, `auth_user`) |

### Current integration status

- **Wired to API:** login only (`POST /api/auth/login` via `lib/api.ts`)
- **Everything else:** in-memory mock data + client-side UI
- **Default API base:** `http://localhost:5000/api`
- **Env override:** `NEXT_PUBLIC_API_URL`

---

## 2. Frontend Routes & Modules

| Route | Module | What the UI does |
|-------|--------|------------------|
| `/login` | Auth | Employee ID + password login |
| `/` | Dashboard | KPIs, sales overview, recent sales, expiry & low-stock widgets |
| `/products` | Product catalog | List/search/add products |
| `/inventory` | Stock | Batches, qty, min/max, expiry, unit price |
| `/inventory/alerts` | Stock alerts | Critical / low stock |
| `/inventory/adjustments` | Adjustments | Expired, damaged, count, theft, return |
| `/inventory/suppliers` | Suppliers | Supplier directory CRUD UI |
| `/inventory/purchase-orders` | POs | List POs |
| `/inventory/purchase-orders/new` | Create PO | Draft / submit with line items + VAT |
| `/inventory/purchase-orders/[id]` | PO detail | Receive goods, cancel, print |
| `/pos` | Point of sale | Cart, 15% VAT, cash / Telebirr / card |
| `/invoices` | Invoices | List, filter, CSV export, print stub |
| `/reports` | Analytics | Revenue / profit / category charts |
| `/reports/expiry` | Expiry analytics | Forecast, dispose / return / clearance |
| `/settings` | Staff & org | Profile, attendance, security stubs, branding |

**Sidebar nav:** Dashboard → Products → Inventory → POS → Invoices → Reports → Settings.

**Auth gap:** There is no route middleware yet. Token is saved after login but not sent on other requests. Sign-out currently navigates to `/login` without always clearing storage (helper `logout()` exists in `lib/api.ts`).

---

## 3. How the Backend Should Be Built

### 3.1 Recommended stack (suggestions)

Any of these work well with this frontend:

| Option | Notes |
|--------|--------|
| **Node.js + Express / Fastify** | Matches default port `5000` and `/api` prefix |
| **NestJS** | Good if you want modules, guards, OpenAPI |
| **Python FastAPI / Django REST** | Fine if team prefers Python |
| **Database** | PostgreSQL recommended (relational pharmacy data) |
| **ORM** | Prisma / TypeORM / Sequelize / SQLAlchemy |

### 3.2 Core conventions the frontend expects

1. **Base URL:** `{HOST}/api` (example: `http://localhost:5000/api`)
2. **Content-Type:** `application/json`
3. **Auth:** JWT (or opaque token) returned as `token`; frontend will later send `Authorization: Bearer <token>`
4. **Errors:** JSON body with `message` string on failure
5. **Currency:** amounts in **ETB**; store as decimal (not float if possible)
6. **VAT:** **15%** on sales and purchase-order totals (frontend hardcodes this)
7. **IDs:** human-readable codes are used in UI:
   - Products: `PRD-*` / SKUs like `AMX-001`
   - Suppliers: `SUP-001`
   - POs: `PO-2023-1045`
   - Invoices: `INV-2023-0891`
   - Adjustments: `#ADJ-*`
   - Employees: `EMP-001`
8. **CORS:** Allow the Next.js origin (e.g. `http://localhost:3000`)
9. **Timezone:** Prefer Africa/Addis_Ababa (EAT) for dates/reports

### 3.3 Suggested high-level architecture

```
Client (Next.js)
    │  HTTPS / JSON
    ▼
API Gateway / Express app  (/api)
    │
    ├── Auth module          (login, me, logout, password)
    ├── Users / Roles        (Admin, Pharmacist, …)
    ├── Products             (catalog)
    ├── Inventory            (batches, stock levels, alerts)
    ├── Adjustments          (stock corrections)
    ├── Suppliers
    ├── Purchase Orders      (draft → pending → shipped → received)
    ├── Sales / POS          (checkout, stock decrement)
    ├── Invoices
    ├── Reports              (aggregations)
    ├── Attendance
    └── Settings / Alerts    (thresholds, org profile)
    │
    ▼
PostgreSQL (+ optional Redis for sessions/cache)
```

### 3.4 Suggested database entities

| Entity | Purpose | Key fields |
|--------|---------|------------|
| `users` | Staff accounts | `id`, `employee_id`, `name`, `email`, `password_hash`, `role`, `phone`, `status`, `avatar_url`, `date_joined` |
| `roles_permissions` | Access control | role → permissions (POS, Inventory, Invoices, System Config, User Mgmt) |
| `products` | Catalog | `id`, `name`, `category`, `sku`, `manufacturer`, `price`, `status` |
| `inventory_batches` | Stock by batch | `product_id`, `batch_no`, `quantity`, `min_stock`, `max_stock`, `expiry_date`, `unit_price`, `location` |
| `suppliers` | Vendors | `name`, `category`, `contact_name`, `email`, `phone`, `address`, `rating`, `status` |
| `purchase_orders` | Procurement | `po_number`, `supplier_id`, `order_date`, `expected_delivery`, `payment_terms`, `status`, `subtotal`, `vat`, `shipping`, `total` |
| `purchase_order_items` | PO lines | `po_id`, `product_id`/`sku`, `name`, `unit_price`, `quantity`, `received_qty` |
| `stock_adjustments` | Corrections | `product/sku`, `type`, `qty_change`, `reason`, `adjusted_by`, `status`, `date` |
| `sales` / `sale_items` | POS transactions | customer, payment method, tendered, change, VAT, totals |
| `invoices` | Billing records | may mirror sales; status Paid/Pending/Overdue/Cancelled |
| `attendance` | Clock in/out | `user_id`, `clock_in`, `clock_out`, `date` |
| `alert_settings` | Thresholds | critical units, lead days, email flags |
| `activity_logs` | Audit trail | actor, action, entity, timestamp |
| `organization` | Branding | pharmacy name, license (EFDA), address, logo |

---

## 4. Authentication (already expected by frontend)

### Implemented client code (`lib/api.ts`)

- **URL:** `POST {NEXT_PUBLIC_API_URL}/auth/login`
- **Default full path:** `http://localhost:5000/api/auth/login`

### Request

```json
{
  "employeeId": "EMP-001",
  "password": "Pharmacy@123"
}
```

### Success response `200`

```json
{
  "message": "Login successful",
  "token": "<jwt-or-opaque-token>",
  "user": {
    "id": "uuid-or-int-as-string",
    "employeeId": "EMP-001",
    "name": "Abebe Kebede",
    "email": "abebe@example.com",
    "role": "Admin"
  }
}
```

`email` may be `null`.

### Error response `4xx`

```json
{
  "message": "Invalid employee ID or password"
}
```

### Demo credentials shown in UI

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | `EMP-001` | `Pharmacy@123` |
| Pharmacist | `EMP-002` | `Pharmacy@123` |

### Client session keys

| Key | Value |
|-----|--------|
| `auth_token` | token string |
| `auth_user` | JSON user object |

### Backend should also provide (frontend not wired yet)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/auth/me` | Current user from Bearer token |
| `POST` | `/api/auth/logout` | Invalidate token/session (optional with JWT) |
| `POST` | `/api/auth/change-password` | Settings security section |
| `POST` | `/api/auth/forgot-password` | Login “Forgot password” stub |

**Seed users** matching the demo IDs so the existing login page works immediately.

---

## 5. Recommended REST API Contract

Use these shapes so the frontend can replace mock data with minimal changes.

All protected routes (except login) should accept:

```http
Authorization: Bearer <token>
```

Standard list response pattern (recommended):

```json
{
  "data": [ /* items */ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 5.1 Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List/search (`q`, `category`, `status`, `page`) |
| `GET` | `/api/products/:id` | Detail |
| `POST` | `/api/products` | Create |
| `PUT/PATCH` | `/api/products/:id` | Update |
| `DELETE` | `/api/products/:id` | Soft-delete / deactivate |

**Product object (matches UI):**

```json
{
  "id": "1",
  "name": "Amoxicillin 500mg Caps",
  "category": "Antibiotics",
  "sku": "AMX-001",
  "manufacturer": "GSK",
  "price": "120.00",
  "stock": 145,
  "status": "Active"
}
```

`status`: `"Active" | "Inactive"`

Example categories used in UI: Antibiotics, Analgesics, Pain Relief, Cardiovascular, Vitamins, Gastrointestinal, Antidiabetic, First Aid, …

---

### 5.2 Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | Stock list (batch-aware) |
| `POST` | `/api/inventory` | Add stock / new batch |
| `PATCH` | `/api/inventory/:id` | Update min/max, location, etc. |
| `GET` | `/api/inventory/alerts` | Low / critical stock |
| `GET` | `/api/inventory/expiring` | Near-expiry batches |

**Inventory item object:**

```json
{
  "id": "1",
  "name": "Amoxicillin 500mg Caps",
  "category": "Antibiotics",
  "batchNo": "BX-7821",
  "stock": 450,
  "minStock": 100,
  "maxStock": 500,
  "expiryDate": "2025-10-01",
  "isExpiringSoon": false,
  "unitPrice": "245.00"
}
```

**Alert item object:**

```json
{
  "id": "1",
  "name": "Ibuprofen 400mg Tabs",
  "supplier": "PharmaCorp",
  "sku": "IBU-400",
  "category": "Pain Relief",
  "status": "Critical",
  "currentStock": 12,
  "unitType": "units",
  "threshold": 50,
  "iconType": "pill"
}
```

`status`: `"Critical" | "Low Stock"`

**Alert settings:**

```json
{
  "criticalUnits": 20,
  "lowStockLeadDays": 7,
  "emailAlerts": true,
  "autoDraftPO": false
}
```

Endpoints: `GET/PUT /api/settings/stock-alerts`

---

### 5.3 Stock adjustments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/adjustments` | Filter by type/date |
| `POST` | `/api/adjustments` | Create adjustment (updates stock) |

```json
{
  "id": "#ADJ-001",
  "date": "2023-10-24",
  "productName": "Amoxicillin 500mg Caps",
  "sku": "AMX-001",
  "type": "Damaged",
  "qtyChange": -10,
  "adjustedBy": "Abebe Kebede",
  "status": "Completed",
  "reason": "Broken blister packs"
}
```

`type`: `"Expired" | "Inventory Count" | "Damaged" | "Theft / Lost" | "Return to Supplier"`  
`status`: `"Completed" | "Pending Review"`

Business rule: applying an adjustment must change batch/product quantity atomically.

---

### 5.4 Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/suppliers` | List |
| `POST` | `/api/suppliers` | Create |
| `PUT/PATCH` | `/api/suppliers/:id` | Update |
| `DELETE` | `/api/suppliers/:id` | Deactivate |

```json
{
  "id": "SUP-001",
  "name": "GlaxoSmithKline (GSK)",
  "category": "Medications",
  "contact": {
    "name": "Sarah Jenkins",
    "email": "s.jenkins@gsk.com",
    "phone": "+251 911 234 567"
  },
  "address": "Addis Ababa",
  "rating": 5,
  "status": "Active"
}
```

`category`: `"Medications" | "Medical Supplies" | "Equipment" | "Diagnostics"`

---

### 5.5 Purchase orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/purchase-orders` | List |
| `GET` | `/api/purchase-orders/:id` | Detail + line items + timeline |
| `POST` | `/api/purchase-orders` | Create (`DRAFT` or `PENDING`) |
| `PATCH` | `/api/purchase-orders/:id` | Update draft |
| `POST` | `/api/purchase-orders/:id/submit` | Draft → Pending |
| `POST` | `/api/purchase-orders/:id/receive` | Receive goods → inventory ++ |
| `POST` | `/api/purchase-orders/:id/cancel` | Cancel |

**PO list object:**

```json
{
  "id": "PO-2023-1045",
  "supplier": {
    "name": "PharmaCorp East Africa",
    "avatar": "PE"
  },
  "dateOrdered": "2023-10-12",
  "expectedDelivery": "2023-10-18",
  "isDelayed": false,
  "total": "45200.00",
  "status": "SHIPPED"
}
```

`status`: `"DRAFT" | "PENDING" | "SHIPPED" | "RECEIVED" | "CANCELLED"`

**Create PO body:**

```json
{
  "poNumber": "PO-2023-1100",
  "supplierId": "SUP-001",
  "orderDate": "2023-10-20",
  "expectedDelivery": "2023-10-27",
  "paymentTerms": "Net 30",
  "status": "DRAFT",
  "items": [
    {
      "name": "Amoxicillin 500mg Caps",
      "sku": "AMX-001",
      "unitPrice": 100,
      "quantity": 200
    }
  ],
  "shipping": 150
}
```

**Totals (match UI):**

- `subtotal` = Σ (unitPrice × quantity)
- `vat` = subtotal × **0.15**
- `shipping` = fixed fee (UI uses **150 ETB** as example)
- `grandTotal` = subtotal + vat + shipping

**Receive shipment body:**

```json
{
  "receivedQtys": { "AMX-001": 200 },
  "batchNumbers": { "AMX-001": "BX-9001" },
  "storageLocations": { "AMX-001": "Shelf A-1" },
  "notes": "All items in good condition",
  "receivedAt": "2023-10-18T10:00:00+03:00"
}
```

On receive: create/update inventory batches and set PO status to `RECEIVED`.

---

### 5.6 POS / Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pos/products` | Sellable catalog with live stock |
| `POST` | `/api/sales` | Complete checkout |
| `POST` | `/api/sales/hold` | Optional: hold cart (UI has Hold) |

**Checkout body:**

```json
{
  "customerName": "Walking Customer",
  "items": [
    { "productId": "1", "name": "Paracetamol 500mg Tabs", "price": 45, "qty": 2 }
  ],
  "paymentMethod": "cash",
  "amountTendered": 200,
  "notes": ""
}
```

`paymentMethod`: `"cash" | "telebirr" | "card"`

**Server must:**

1. Validate stock availability
2. Compute `subtotal`, `vat = subtotal * 0.15`, `total`
3. For cash: compute `changeDue`
4. Decrement inventory (prefer FEFO: earliest expiry first)
5. Create sale + invoice record
6. Return invoice number

**Response example:**

```json
{
  "message": "Sale completed",
  "invoiceNumber": "INV-2023-0892",
  "subtotal": 90,
  "vat": 13.5,
  "total": 103.5,
  "changeDue": 96.5,
  "paymentMethod": "cash"
}
```

---

### 5.7 Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/invoices` | Filters: status, dateFrom, dateTo, q |
| `GET` | `/api/invoices/:id` | Detail + line items |
| `PATCH` | `/api/invoices/:id/status` | Update payment status |
| `GET` | `/api/invoices/export` | CSV export (or generate client-side from list) |

```json
{
  "id": "INV-2023-0891",
  "customerName": "Abebe Kebede",
  "date": "2023-10-24",
  "amount": "4500.00",
  "paymentMethod": "Cash",
  "status": "Paid"
}
```

`paymentMethod`: `"Cash" | "Card" | "Bank Transfer" | "Telebirr"`  
`status`: `"Paid" | "Pending" | "Overdue" | "Cancelled"`

---

### 5.8 Dashboard & reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | KPI cards + widgets |
| `GET` | `/api/reports/sales` | `range=today\|week\|month` |
| `GET` | `/api/reports/revenue-profit` | Charts data |
| `GET` | `/api/reports/by-category` | Donut chart |
| `GET` | `/api/reports/expiry` | Expiry forecast + list |
| `PUT` | `/api/settings/expiry-alerts` | Expiry alert config |

**Dashboard payload (suggested):**

```json
{
  "stats": {
    "todaySales": 12500,
    "totalProducts": 320,
    "lowStockCount": 8,
    "expiringSoonCount": 5
  },
  "salesOverview": {
    "range": "Week",
    "points": [{ "label": "Mon", "value": 3200 }]
  },
  "recentSales": [],
  "expiryAlerts": [],
  "lowStockAlerts": []
}
```

**Expiry item:**

```json
{
  "id": "1",
  "product": "Amoxicillin 500mg Caps",
  "batchNo": "BX-7821",
  "expiryDate": "2025-10-01",
  "status": "Critical",
  "qty": 40,
  "value": 9800,
  "actionType": "Dispose"
}
```

Expiry actions used in UI: dispose / return to supplier / clearance sale / monitor.

**Expiry alert settings:**

```json
{
  "leadDays": 90,
  "criticalDays": 30,
  "autoDiscount": false,
  "emailNotification": true
}
```

---

### 5.9 Users, settings, attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me` | Profile |
| `PATCH` | `/api/users/me` | Edit name, phone, email |
| `POST` | `/api/users/me/avatar` | Upload avatar (multipart) |
| `GET` | `/api/attendance` | History |
| `POST` | `/api/attendance/clock-in` | Clock in |
| `POST` | `/api/attendance/clock-out` | Clock out |
| `GET` | `/api/activity` | Audit log for settings page |
| `GET/PUT` | `/api/organization` | Pharmacy branding / license info |

**Profile edit body:**

```json
{
  "fullName": "Abebe Kebede",
  "phone": "+251 911 000 000",
  "email": "abebe@gammo.et"
}
```

**Roles suggested:**

| Role | Typical access |
|------|----------------|
| `Admin` | Full access including system config & user management |
| `Pharmacist` | POS, inventory, invoices (no system config / user mgmt) |

---

## 6. Business Rules Checklist

Implement these rules on the backend (frontend currently fakes some of them):

1. **Never sell more than available stock**
2. **FEFO stock deduction** (First Expiry, First Out) preferred for pharmacy
3. **Batch tracking** required (batch number + expiry)
4. **VAT 15%** on POS and PO calculations
5. **Currency ETB** everywhere
6. **Receiving a PO** increases inventory batches
7. **Adjustments** change stock and leave an audit trail
8. **Low-stock alerts** when `stock <= minStock` (critical when below a smaller threshold)
9. **Expiry alerts** based on lead/critical days settings
10. **Role-based authorization** on sensitive endpoints
11. **Passwords** hashed (bcrypt/argon2); never return hash to client
12. **Idempotent checkout** optional but useful (client request id) to avoid double sales

---

## 7. Environment & Local Setup

### Frontend

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run:

```bash
npm install
npm run dev
```

App: `http://localhost:3000`

### Backend (suggested)

```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/gammo_pharmacy
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
VAT_RATE=0.15
CURRENCY=ETB
TZ=Africa/Addis_Ababa
```

Expose API under `/api` so it matches `lib/api.ts`.

---

## 8. Suggested Implementation Order

Build in this order so the UI can be connected gradually:

1. **Auth** — login + JWT + seed `EMP-001` / `EMP-002`
2. **Users / me** — profile for header & settings
3. **Products** — catalog CRUD
4. **Inventory batches** — stock list + alerts
5. **Suppliers**
6. **Purchase orders** — create, receive, cancel
7. **Adjustments**
8. **POS / sales** — critical path for revenue
9. **Invoices**
10. **Dashboard + reports**
11. **Attendance + activity logs**
12. **Alert / org settings**

---

## 9. Frontend Files Relevant to Backend Work

| Path | Why it matters |
|------|----------------|
| `lib/api.ts` | Only live API client; login contract |
| `app/login/page.tsx` | Login UX + demo credentials |
| `app/products/page.tsx` | Product model |
| `app/inventory/*.tsx` | Stock, alerts, adjustments, suppliers, POs |
| `app/pos/page.tsx` | Cart, VAT, payment methods |
| `app/invoices/page.tsx` | Invoice fields |
| `app/reports/**` | Analytics expectations |
| `app/settings/page.tsx` | Profile, attendance, permissions UI |
| `components/sidebar.tsx` | Module map |

---

## 10. What Is Missing on the Frontend (for later)

When backend is ready, frontend still needs:

- Attach `Authorization: Bearer` on all requests
- Replace mock arrays with API calls (extend `lib/api.ts` or add modules)
- Protect routes (redirect to `/login` if no token)
- Use real user from `auth_user` in sidebar/header (currently hardcoded)
- Call `logout()` on sign-out
- Wire remember-me / forgot-password if required
- Upload avatar to server instead of local preview only

---

## 11. Quick Reference — Enums

| Domain | Values |
|--------|--------|
| Product status | `Active`, `Inactive` |
| Supplier category | `Medications`, `Medical Supplies`, `Equipment`, `Diagnostics` |
| Supplier status | `Active`, `Inactive` |
| PO status | `DRAFT`, `PENDING`, `SHIPPED`, `RECEIVED`, `CANCELLED` |
| Adjustment type | `Expired`, `Inventory Count`, `Damaged`, `Theft / Lost`, `Return to Supplier` |
| Alert status | `Critical`, `Low Stock` |
| POS payment | `cash`, `telebirr`, `card` |
| Invoice payment | `Cash`, `Card`, `Bank Transfer`, `Telebirr` |
| Invoice status | `Paid`, `Pending`, `Overdue`, `Cancelled` |
| Roles (demo) | `Admin`, `Pharmacist` |

---

## 12. Summary

This repository is a **Next.js UI prototype** for **Gammo Pharmacy**. Only authentication talks to a real API today. The screens already define the domain models, enums, VAT rules, and Ethiopian pharmacy workflow you should implement on the backend.

**Minimum to unblock the app:** implement `POST /api/auth/login` returning `{ message, token, user }` with seeded employees `EMP-001` and `EMP-002`.

**To make the product real:** implement the modules in section 5 in the order listed in section 8, using PostgreSQL + JWT + CORS for `localhost:3000`.
