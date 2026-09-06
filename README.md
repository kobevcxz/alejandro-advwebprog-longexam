# CTWEBPGL Web Programming - Long Exam 1

This repository contains a full-stack e-commerce application called **BulldogEx Shop**, a campus marketplace platform built with a **React (Vite) client** (`alejandro-client`) and a **Node.js/Express + MongoDB server** (`alejandro-server`). It includes product catalog browsing, cart and checkout, order tracking, product reviews, user account management, and role-based dashboards for **admin**, **seller**, and **buyer** accounts.

---

## 1. Client-Server Integration

The client and server operate as two independent applications linked via a centralized REST API architecture:
- **API Routing**: The Express server mounts all backend resource controllers under the `/api` prefix (e.g., `/api/product`, `/api/user`, `/api/order`) inside `index.js`.
- **Environment Binding**: The React frontend dynamically consumes the backend URL using Vite environment variables (`VITE_API_URL=http://localhost:8000/api`).
- **Centralized Service Layer**: All HTTP requests are abstracted inside `alejandro-client/src/services/` using scoped Axios modules (`ProductService.js`, `CartService.js`, `UserService.js`, etc.), preventing raw API calls inside UI components.
- **Token-Based Communication**: User authentication relies on JSON Web Tokens (JWT). Upon sign-in, the server issues a token stored in `localStorage`, which the client automatically injects into outgoing request headers as a Bearer token (`Authorization: Bearer <token>`).

---

## 2. Libraries and Packages Used

### Client-Side Libraries (`alejandro-client/package.json`)
- **`react` & `react-dom`**: Core library components for building modular user interfaces and managing the virtual DOM tree.
- **`vite` & `@vitejs/plugin-react`**: High-performance frontend build tool and development server providing instant Hot Module Replacement (HMR).
- **`react-router-dom`**: Handles client-side multi-page routing, URL parameter mapping (`/products/:name`), and layout nesting (`<Outlet />`).
- **`axios`**: Promise-based HTTP client utilized in the service layer to communicate with the Express REST API.
- **`@mui/material`, `@mui/icons-material`, & `@mui/x-data-grid`**: UI component library powering admin data grids, icons, and structured form elements.
- **`tailwindcss` & `@tailwindcss/vite`**: Utility-first CSS framework configured for custom institutional branding (gold `#FDB913` and blue `#003A8F`).
- **`dotenv`**: Manages environment variables injected at build time.

### Server-Side Libraries (`alejandro-server/package.json`)
- **`express`**: Minimalist web framework handling routing, HTTP requests, and middleware pipeline configuration.
- **`mongoose`**: Object Data Modeling (ODM) library used to define strict schemas and interact seamlessly with MongoDB clusters.
- **`jsonwebtoken`**: Generates and verifies cryptographic JWT tokens for securing protected routes.
- **`bcryptjs`**: Secure hashing utility used to encrypt user passwords before database persistence.
- **`cors`**: Enables cross-origin resource sharing so the React frontend can query the Express server securely.
- **`dotenv`**: Loads sensitive configuration keys (`MONGO_URI`, `SECRET_KEY`, `PORT`) from local environment files.
- **`nodemon`**: Development utility that automatically restarts the server instance upon file modifications.

---

## 3. Design Patterns Used

### Client-Side Design Patterns (React)
- **Component-Based Architecture**: The interface is broken down into small, isolated, and reusable UI components (`Button`, `ProductCard`, `ProductList`, `NavBar`, `Footer`).
- **Layout / Composition Pattern**: Implements shared layout wrappers (`Layout`, `AuthLayout`, `DashLayout`) using React Router's nested `<Outlet />` element to preserve navigation bars and footers across pages.
- **Service Layer Pattern**: Decouples UI components from networking logic by routing all HTTP communications through dedicated service files (`src/services/*.js`).
- **Provider / Context Pattern**: Utilizes React Context (`AuthContext.jsx`) for global state management to handle user sessions and role permissions globally.

### Server-Side Design Patterns (Express & MongoDB)
- **MVC (Model-View-Controller) Architecture**: Enforces clean separation of concerns by isolating database schemas (`models/`), business logic handlers (`controllers/`), and endpoint definitions (`routes/`).
- **Middleware Pattern**: Implements modular security pipelines (`authMiddleware.js`, `roleMiddleware.js`) that intercept requests to validate authentication tokens and enforce role-based access control (Admin/Seller/Buyer).
- **Repository-style Data Access**: Encapsulates database querying logic within Mongoose models, abstracting direct MongoDB driver interactions.

---

## 4. Current Routes (Client)

| Route | Description |
| :--- | :--- |
| `/` | Home page (`HomePage.jsx`) |
| `/about` | About page (`AboutPage.jsx`) |
| `/products` | Product list page (`ProductListPage.jsx`) |
| `/products/:name` | Single product detail page (`ProductPage.jsx`) |
| `/cart` | Shopping cart page (`CartPage.jsx`) |
| `/orders` | Order history tracking page (`OrderPage.jsx`) |
| `/reviews` | Buyer review management page (`ReviewPage.jsx`) |
| `/account` | User account settings and credentials |
| `/auth/signin` & `/auth/signup` | Authentication interfaces |
| `/dashboard` | Main role-based management dashboard |
| `/dashboard/dashproducts` | Product inventory management |
| `/dashboard/dashorders` | Customer order management |
| `/dashboard/dashreviews` | Admin review moderation dashboard (`DashReviewPage.jsx`) |
| `/dashboard/users` | User management interface |
| `/dashboard/reports` | System analytical reports |

---

## 5. Current API Base Paths (Server)

| Endpoint | Description |
| :--- | :--- |
| `/api/product` | Product CRUD and catalog listings |
| `/api/category` | Product category management |
| `/api/user` | Authentication, registration, and user profiles |
| `/api/review` | Review creation, moderation, and fetching |
| `/api/cart` | Shopping cart persistence operations |
| `/api/order` | Checkout processing, order history, and status updates |

---

## 6. Project File Structure & Outline

```text
ALEJANDRO-ADVWEBPROG/
├── README.md
├── alejandro-client/                         # React + Vite frontend
│   ├── .env                                  # VITE_API_URL configuration
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                           # Route tree & layout bindings
│       ├── main.jsx                          # Application root with AuthProvider
│       ├── constants.js                      # Host configuration variables
│       ├── assets/                           # Static images and product content
│       ├── components/                       # Reusable UI components
│       ├── context/
│       │   └── AuthContext.jsx               # Global authentication context
│       ├── layouts/                          # Layout, AuthLayout, DashLayout
│       ├── services/                         # Axios API service handlers
│       └── pages/
│           ├── NotFoundPage.jsx
│           ├── AuthPages/                    # SignInPage.jsx, SignUpPage.jsx
│           ├── LandingPages/                 # Storefront pages
│           └── DashboardPages/               # Admin/Seller dashboards
│
└── alejandro-server/                         # Express + MongoDB backend
    ├── .env                                  # Environment credentials
    ├── index.js                              # Express app entry point & middleware binder
    ├── package.json
    ├── vercel.json                           # Deployment configuration
    ├── config/                               # config.js, constants.js, db.js
    ├── middleware/                           # authMiddleware.js, roleMiddleware.js
    ├── models/                               # Mongoose database schemas
    ├── controllers/                          # Business logic route handlers
    └── routes/                               # Express routers (article, cart, category, order, product, review, user)

    
## 7. Project Setup & Installation

### Server Setup

Open your terminal and navigate to the server folder:
```bash
cd alejandro-server
Install the dependencies:
npm install
Create a .env file inside alejandro-server/ with the following variables:
>>>>>>> 08b5c4c (Update README.md)
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000

npm run dev

cd alejandro-client
npm install

VITE_API_URL=http://localhost:8000/api

npm run dev

Run the development server:
npm run dev

Client Setup
Navigate to the client folder:
cd alejandro-client

Install the dependencies:
npm install

Create a .env file inside alejandro-client/ with:
VITE_API_URL=http://localhost:8000/api

Start the development server:
npm run dev

