# CTWEBPGL Web Programming - Long Exam 1

This repository contains a full-stack e-commerce application called **BulldogEx Shop**, a campus marketplace platform built with a **React (Vite) client** (`alejandro-client`) and a **Node.js/Express + MongoDB server** (`alejandro-server`). It includes product catalog browsing, cart and checkout, order tracking, product reviews, user account management, and role-based dashboards for **admin**, **seller**, and **buyer** accounts.

---

## Architecture Overview

The project is split into two independent applications that communicate over a REST API:

- `alejandro-client/` — React (Vite) frontend application.
- `alejandro-server/` — Express + MongoDB backend application.

---

## Tech Stack

### Client (`alejandro-client`)

| Package | Purpose |
| :--- | :--- |
| `react` / `react-dom` | Core UI library used to build the component tree. |
| `vite` / `@vitejs/plugin-react` | Dev server and build tool with fast HMR for React. |
| `react-router-dom` | Client-side routing — defines the route tree in `App.jsx` and handles nested layouts. |
| `axios` | HTTP client used inside the `services/` layer to call the Express API. |
| `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid` | Material UI library used for admin records, data grids, and form controls. |
| `tailwindcss` / `@tailwindcss/vite` | Utility-first CSS framework for custom gold (`#FDB913`) and blue (`#003A8F`) branding. |
| `dotenv` | Loads environment variables (`VITE_API_URL`) into the client build. |

### Server (`alejandro-server`)

| Package | Purpose |
| :--- | :--- |
| `express` | Web framework used to define REST routes, middleware, and the HTTP server. |
| `mongoose` | ODM used to define schemas/models and query MongoDB. |
| `jsonwebtoken` | Issues and verifies JWT access tokens for protected routes. |
| `bcryptjs` | Hashes and compares user passwords securely. |
| `cors` | Enables cross-origin requests from the client. |
| `dotenv` | Loads environment variables (`MONGO_URI`, `SECRET_KEY`, `SALT`, `PORT`). |
| `nodemon` *(dev)* | Restarts the server automatically on file changes during development. |

---

## Client-Server Integration

1. **REST API Exposure**: The Express app connects to MongoDB and mounts resource routers under `/api`:
   ```js
   app.use("/api/product", productRoutes);
   app.use("/api/category", categoryRoutes);
   app.use("/api/user", userRoutes);
   app.use("/api/review", reviewRoutes);
   app.use("/api/cart", cartRoutes);
   app.use("/api/order", orderRoutes);

   Environment Configuration: The client reads the API host URL from Vite environment variables:

Code snippet
VITE_API_URL=http://localhost:8000/api
Service Layer: All HTTP calls are centralized inside src/services/ (OrderService.js, ReviewService.js, ProductService.js, UserService.js, CartService.js) using scoped Axios instances.

JWT Authentication: The server issues a JWT on sign-in stored in localStorage. Protected requests attach it as a Bearer token:

JavaScript
headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
Role-Based Access Control: Roles (admin, seller, buyer) are managed via AuthContext to control frontend UI rendering and secured on the backend via roleMiddleware.js.

Design Patterns
Client (React)
Component-Based Architecture — UI decomposed into small, reusable components (Button, ProductCard, ProductList, NavBar, Footer).

Layout / Composition Pattern — Shared layouts (Layout, AuthLayout, DashLayout) utilizing <Outlet/> for nested routing.

Service Layer Pattern — Centralized Axios calls in src/services/*.js.

Provider / Context Pattern — Global session state management via AuthContext.jsx.

Server (Express + MongoDB)
MVC Architecture — Separation of concerns across models/, controllers/, and routes/.

Middleware Pattern — Modular security gates (authMiddleware.js, roleMiddleware.js).

Repository-style Data Access — Encapsulated schema querying using Mongoose models.

Project Setup & Installation
1. Server Setup
Bash
cd alejandro-server
npm install
Create a .env file inside alejandro-server/:

Code snippet
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000
Run the development server:

Bash
npm run dev
2. Client Setup
Bash
cd alejandro-client
npm install
Create a .env file inside alejandro-client/:

Code snippet
VITE_API_URL=http://localhost:8000/api
Start the development server:

Bash
npm run dev
Current Routes (Client)
/ — Home page (HomePage.jsx)

/about — About page (AboutPage.jsx)

/products — Product list page (ProductListPage.jsx)

/products/:name — Single product page (ProductPage.jsx)

/cart — Cart page (CartPage.jsx)

/orders — Order history page (OrderPage.jsx)

/reviews — Buyer review management page (ReviewPage.jsx)

/account — Account settings and credential updates (AccountPage.jsx)

/auth/signin & /auth/signup — Authentication pages

/dashboard — Main Dashboard

/dashboard/dashproducts — Product management

/dashboard/dashorders — Order management

/dashboard/dashreviews — Admin review management dashboard (DashReviewPage.jsx)

/dashboard/users — User management

/dashboard/reports — Reports

Current API Base Paths (Server)
/api/product — Product CRUD and listing

/api/category — Category CRUD

/api/user — Auth and user profile management

/api/review — Review CRUD and product reviews

/api/cart — Cart operations

/api/order — Checkout, order history, and status updates

Project File Outline
Plaintext
ALEJANDRO-ADVWEBPROG/
├── README.md
├── alejandro-client/                         # React + Vite frontend
│   ├── .env                                  # VITE_API_URL
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                           # Route tree & layouts
│       ├── main.jsx                          # React root with AuthProvider
│       ├── constants.js                      # Host configuration constants
│       ├── assets/                           # Images and product contents
│       ├── components/                       # Reusable UI components
│       ├── context/
│       │   └── AuthContext.jsx               # Auth session management
│       ├── layouts/                          # Layout, AuthLayout, DashLayout
│       ├── services/                         # Axios API service handlers
│       └── pages/
│           ├── NotFoundPage.jsx
│           ├── AuthPages/                    # SignInPage.jsx, SignUpPage.jsx
│           ├── LandingPages/                 # Storefront pages
│           └── DashboardPages/               # Admin/Seller dashboards
│
└── alejandro-server/                         # Express + MongoDB backend
    ├── .env                                  # Environment variables
    ├── index.js                              # App entry point
    ├── package.json
    ├── vercel.json                           # Vercel deployment config
    ├── config/                               # config.js, constants.js, db.js
    ├── middleware/                           # authMiddleware.js, roleMiddleware.js
    ├── models/                               # Database schemas (Mongoose)
    ├── controllers/                          # Business logic handlers
    └── routes/                               # Express routers (article, cart, category, order, product, review, user)

### Step 2: Paste into VS Code
1. Open your **`README.md`** file in VS Code.
2. Select everything inside it (`Ctrl+A` or `Cmd+A`) and delete it.
3. Paste the copied code (`Ctrl+V` or `Cmd+V`) and save the file (`Ctrl+S` or `Cmd+S`).

Once you push it to GitHub, GitHub will automatically render it with clean headers, structured tables, and code formatting just like your classmate's!