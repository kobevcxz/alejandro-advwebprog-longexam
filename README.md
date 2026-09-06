# CTWEBPGL Web Programming - Long Exam 1

This repository contains a full-stack e-commerce application called **BulldogEx Shop**, a campus marketplace platform built with a **React (Vite) client** (`alejandro-client`) and a **Node.js/Express + MongoDB server** (`alejandro-server`). It includes product catalog browsing, cart and checkout, order tracking, product reviews, user account management, and role-based dashboards for **admin**, **seller**, and **buyer** accounts.

The project is split into two independent applications that communicate over a REST API:

```text
ALEJANDRO-ADVWEBPROG/
├── alejandro-client/     # React (Vite) frontend
└── alejandro-server/     # Express + MongoDB backend

Tech Stack
Client (alejandro-client)
Package	Purpose
react / react-dom	Core UI library used to build the component tree.
vite / @vitejs/plugin-react	Dev server and build tool with fast HMR for React.
react-router-dom	Client-side routing — defines the route tree in App.jsx and handles nested layouts (Layout, AuthLayout, DashLayout).
axios	HTTP client used inside the services/ layer to call the Express API.
@mui/material, @mui/icons-material, @mui/x-data-grid	Material UI component library — used for admin dashboard records, data grids, ratings, and form controls.
tailwindcss / @tailwindcss/vite	Utility-first CSS framework used for storefront pages and custom gold (#FDB913) and blue (#003A8F) branding.
dotenv	Loads environment variables (e.g. VITE_API_URL) into the client build.
eslint	Linting for code quality and React best practices.
Server (alejandro-server)
Package	Purpose
express	Web framework used to define REST routes, middleware, and the HTTP server.
mongoose	ODM used to define schemas/models (Product, Category, User, Review, Cart, Order) and query MongoDB.
jsonwebtoken	Issues and verifies JWT access tokens for authenticated routes.
bcryptjs	Hashes and compares user passwords before storing/authenticating.
cors	Enables cross-origin requests from the client.
dotenv	Loads .env values (MONGO_URI, SECRET_KEY, SALT, PORT) used by configuration files.
nodemon (dev)	Restarts the server automatically on file changes during development.
Integrating the Client and the Server
The client and server are two separate Node projects connected purely through HTTP calls.

1. Server exposes a REST API
The Express app connects to MongoDB and mounts resource routers under /api:

JavaScript
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
2. Client points to the server via an environment variable
The client reads the API host URL from Vite's environment variables:

Code snippet
VITE_API_URL=http://localhost:8000/api
3. Client calls the API through a Service Layer
All HTTP communication is centralized in src/services/ (OrderService.js, ReviewService.js, ProductService.js, UserService.js, CartService.js) using scoped Axios instances so UI components stay decoupled from API endpoint structures.

4. Authentication is passed via JWT Bearer tokens
The server issues a JWT on sign-in which is stored in localStorage. Protected service requests attach it as a Bearer token in the headers:

JavaScript
headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
On the server, authMiddleware.js verifies this token, decoding user credentials into req.user.

5. Role-based access is resolved on both ends
The user's role (admin, seller, buyer) is managed via AuthContext, controlling frontend UI rendering (such as switching tabs between "To Review" and "Review History", or rendering admin data grids) while server middleware and query scoping secure backend endpoints.

Design Patterns
Client (React)
Component-Based Architecture — UI decomposed into small, reusable components (Button, ProductCard, ProductList, NavBar, Footer).

Layout / Composition Pattern — Shared layouts (Layout, AuthLayout, DashLayout) utilizing <Outlet/> for nested routing.

Service Layer Pattern — Centralized Axios calls in src/services/*.js.

Provider / Context Pattern — Global session state management via AuthContext.jsx.

Controlled Components Pattern — Forms built with controlled React state (useState + onChange).

Server (Express + MongoDB)
MVC Architecture — Separation of concerns across models/, controllers/, and routes/.

Middleware Pattern — Modular security gates (authMiddleware.js, roleMiddleware.js) handling authentication and role permissions.

Repository-style Data Access — Encapsulated schema querying using Mongoose models.

RESTful Resource Routing — Standardized HTTP verbs mapped to CRUD operations.

Centralized Error Handling & Configuration — Isolated environment variables and uniform JSON error responses.

Project Setup
Server
Bash
cd alejandro-server
npm install
Create a .env file inside alejandro-server/:

Code snippet
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000
Run in development mode:

Bash
npm run dev
Client
Bash
cd alejandro-client
npm install
Create a .env file inside alejandro-client/:

Code snippet
VITE_API_URL=http://localhost:8000/api
Start development server:

Bash
npm run dev
Current Routes (Client)
/ - Home page (HomePage.jsx)

/about - About page (AboutPage.jsx)

/products - Product list page (ProductListPage.jsx)

/products/:name - Single product page (ProductPage.jsx)

/cart - Cart page (CartPage.jsx)

/orders - Order history page (OrderPage.jsx)

/reviews - Buyer review management page (ReviewPage.jsx with "To Review" and "Review History" tabs)

/account - Account settings and credential updates (AccountPage.jsx)

/auth/signin & /auth/signup - Authentication pages

/dashboard - Main Dashboard

/dashboard/dashproducts - Product management

/dashboard/dashorders - Order management

/dashboard/dashreviews - Admin review management dashboard (DashReviewPage.jsx)

/dashboard/users - User management

/dashboard/reports - Reports

Current API Base Paths (Server)
/api/product - Product CRUD and listing

/api/category - Category CRUD

/api/user - Auth and user profile management

/api/review - Review CRUD, fetching all reviews and product-specific reviews

/api/cart - Cart operations

/api/order - Checkout, order history, order cancellation, and status updates

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
│       ├── App.jsx                           # Route tree (Layout / AuthLayout / DashLayout)
│       ├── main.jsx                          # React root, wraps App with AuthProvider
│       ├── constants.js                      # Reads VITE_API_URL into HOST
│       ├── assets/                           # Static assets, images, and product content
│       ├── components/                       # Reusable UI (Button, NavBar, Footer, ProductCard, ProductList, ProtectedRoute)
│       ├── context/
│       │   └── AuthContext.jsx               # Provider/Context pattern for auth session state
│       ├── layouts/                          # Shared page chrome via <Outlet/>
│       │   ├── Layout.jsx                    # Public storefront layout
│       │   ├── AuthLayout.jsx                # Sign in/up layout
│       │   └── DashLayout.jsx                # Dashboard layout
│       ├── services/                         # Service Layer — Axios calls per resource
│       │   ├── ProductService.js
│       │   ├── ReviewService.js
│       │   ├── OrderService.js
│       │   ├── CartService.js
│       │   └── UserService.js
│       └── pages/
│           ├── NotFoundPage.jsx
│           ├── AuthPages/                    # SignInPage.jsx, SignUpPage.jsx
│           ├── LandingPages/                 # HomePage, AboutPage, ProductListPage, ProductPage, CartPage, OrderPage, ReviewPage, AccountPage
│           └── DashboardPages/               # DashboardPage, DashProductListPage, DashOrderListPage, DashReviewPage, UsersPage, ReportsPage
│
└── alejandro-server/                         # Express + MongoDB backend
    ├── .env                                  # MONGO_URI, SECRET_KEY, SALT, PORT
    ├── index.js                              # App entry point
    ├── package.json
    ├── vercel.json                           # Vercel deployment configuration
    ├── config/                               # config.js, constants.js, db.js
    ├── middleware/                           # authMiddleware.js, roleMiddleware.js
    ├── models/                               # cartModel, categoryModel, orderModel, productModel, reviewModel, userModel
    ├── controllers/                          # cartController, categoryController, orderController, productController, reviewController, userController
    └── routes/                               # articleRoutes, cartRoutes, categoryRoutes, orderRoutes, productRoutes, reviewRoutes, userRoutes