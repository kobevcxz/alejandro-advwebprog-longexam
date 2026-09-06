# CTWEBPGL Web Programming - Long Exam 1

This repository contains a full-stack e-commerce application called **BulldogEx Shop**, a campus marketplace platform built with a **React (Vite) client** (`alejandro-client`) and a **Node.js/Express + MongoDB server** (`alejandro-server`).

It includes product catalog browsing, cart and checkout, order tracking, product reviews, user account management, and role-based dashboards for **admin**, **seller**, and **buyer** accounts.

---

## 1. Client-Server Integration

The client and server operate as two independent applications linked through a centralized REST API architecture.

### API Routing

The Express server mounts backend resource controllers under the `/api` prefix inside `index.js`.

Examples:

* `/api/product`
* `/api/category`
* `/api/user`
* `/api/review`
* `/api/cart`
* `/api/order`

### Environment Binding

The React frontend consumes the backend URL using Vite environment variables.

The client `.env` file contains:

```env
VITE_API_URL=http://localhost:8000/api
```

This allows the backend URL to be changed without modifying the application source code.

### Centralized Service Layer

HTTP requests are organized inside:

`alejandro-client/src/services/`

The service layer uses Axios modules such as:

* `ProductService.js`
* `CartService.js`
* `UserService.js`
* `OrderService.js`
* `ReviewService.js`
* `CategoryService.js`

This separates API communication from the user interface components.

### Token-Based Communication

User authentication uses JSON Web Tokens (JWT).

After signing in, the server generates a JWT token. The client stores the token in `localStorage` and sends it with protected requests using the following authorization format:

```text
Authorization: Bearer <token>
```

The server verifies the token through authentication middleware before allowing access to protected resources.

---

## 2. Libraries and Packages Used

### Client-Side Libraries

#### React and React DOM

`react` and `react-dom` are the core libraries used to build the application's user interface and reusable components.

#### Vite

`vite` is used as the frontend development server and build tool. It provides fast development and Hot Module Replacement (HMR).

#### React Router DOM

`react-router-dom` is used for client-side routing and navigation between pages.

Examples include:

* `/`
* `/products`
* `/products/:name`
* `/cart`
* `/orders`
* `/reviews`
* `/account`
* `/auth/signin`
* `/auth/signup`
* `/dashboard`

#### Axios

`axios` is used to send HTTP requests from the React client to the Express server. It handles GET, POST, PUT, and DELETE requests.

#### Material UI

The following Material UI packages are used:

* `@mui/material`
* `@mui/icons-material`
* `@mui/x-data-grid`

These packages provide reusable interface components, icons, forms, tables, and data grids.

#### Tailwind CSS

The project uses:

* `tailwindcss`
* `@tailwindcss/vite`

Tailwind CSS is used for styling, responsive layouts, and utility-based design.

The project uses the following branding colors:

* Gold: `#FDB913`
* Blue: `#003A8F`

#### Dotenv

`dotenv` is used to manage environment variables for application configuration.

### Server-Side Libraries

#### Node.js

Node.js provides the runtime environment for executing the backend JavaScript application.

#### Express.js

`express` is used to create the REST API, handle HTTP requests and responses, define routes, and configure middleware.

#### Mongoose

`mongoose` is used as the Object Data Modeling (ODM) library for MongoDB.

It is used to define schemas and interact with MongoDB collections such as:

* Users
* Products
* Categories
* Cart
* Orders
* Reviews

#### JSON Web Token

`jsonwebtoken` is used to generate and verify authentication tokens for protected API routes.

#### bcryptjs

`bcryptjs` is used to hash user passwords before storing them in the database.

#### CORS

`cors` enables Cross-Origin Resource Sharing so the React frontend can communicate with the Express backend.

#### Dotenv

`dotenv` loads server configuration and sensitive environment variables from the `.env` file.

Examples include:

```env
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000
```

#### Nodemon

`nodemon` automatically restarts the Node.js server when changes are made during development.

---

## 3. Design Patterns Used

### Client-Side Design Patterns

#### Component-Based Architecture

The React client uses a component-based architecture where the interface is divided into reusable components.

Examples include:

* `Button`
* `ProductCard`
* `ProductList`
* `NavBar`
* `Footer`

This makes the interface easier to maintain and reuse.

#### Layout and Composition Pattern

The application uses shared layouts such as:

* `Layout`
* `AuthLayout`
* `DashLayout`

React Router's nested routes and `<Outlet />` are used to display pages inside shared layouts.

#### Service Layer Pattern

The Service Layer Pattern separates API communication from UI components.

API requests are handled inside:

`src/services/`

This keeps networking logic separate from the presentation layer.

#### Context / Provider Pattern

React Context is used through `AuthContext.jsx` to manage authentication information globally.

It allows different components to access the current user's authentication state and role permissions.

### Server-Side Design Patterns

#### MVC Architecture

The server follows the Model-View-Controller (MVC) architectural pattern.

The application separates responsibilities into:

* `models/` – Database schemas
* `controllers/` – Business logic
* `routes/` – API endpoint definitions

#### Middleware Pattern

Middleware is used to process requests before they reach the controllers.

Examples include:

* `authMiddleware.js`
* `roleMiddleware.js`

Authentication middleware verifies JWT tokens, while role middleware controls access based on user roles.

The supported roles are:

* Admin
* Seller
* Buyer

#### Repository-Style Data Access

Database operations are organized through Mongoose models. This provides an abstraction between the controllers and the MongoDB database.

---

## 4. Client Routes

| Route                     | Description                  |
| ------------------------- | ---------------------------- |
| `/`                       | Home page                    |
| `/about`                  | About page                   |
| `/products`               | Product list page            |
| `/products/:name`         | Product detail page          |
| `/cart`                   | Shopping cart page           |
| `/orders`                 | Order history and tracking   |
| `/reviews`                | Buyer review management      |
| `/account`                | User account settings        |
| `/auth/signin`            | Sign-in page                 |
| `/auth/signup`            | Sign-up page                 |
| `/dashboard`              | Role-based dashboard         |
| `/dashboard/dashproducts` | Product inventory management |
| `/dashboard/dashorders`   | Customer order management    |
| `/dashboard/dashreviews`  | Review moderation dashboard  |
| `/dashboard/users`        | User management              |
| `/dashboard/reports`      | System reports               |

---

## 5. Server API Base Paths

| Endpoint        | Description                                     |
| --------------- | ----------------------------------------------- |
| `/api/product`  | Product CRUD and catalog operations             |
| `/api/category` | Product category management                     |
| `/api/user`     | Authentication, registration, and user profiles |
| `/api/review`   | Review creation, moderation, and retrieval      |
| `/api/cart`     | Shopping cart operations                        |
| `/api/order`    | Checkout, order history, and status updates     |

---

## 6. Project File Structure and Outline

The project follows a separated client-server architecture.

```text
ALEJANDRO-ADVWEBPROG/
│
├── README.md
│
├── alejandro-client/                    # React + Vite Frontend
│   │
│   ├── .env                             # Client environment variables
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   └── src/
│       │
│       ├── App.jsx                      # Application routes
│       ├── main.jsx                     # Application entry point
│       ├── constants.js                 # Client configuration
│       │
│       ├── assets/                      # Images and static assets
│       │
│       ├── components/                  # Reusable UI components
│       │
│       ├── context/
│       │   └── AuthContext.jsx           # Global authentication state
│       │
│       ├── layouts/                      # Shared application layouts
│       │
│       ├── services/                     # Axios API service handlers
│       │
│       └── pages/
│           │
│           ├── NotFoundPage.jsx
│           │
│           ├── AuthPages/                # Authentication pages
│           │   ├── SignInPage.jsx
│           │   └── SignUpPage.jsx
│           │
│           ├── LandingPages/             # Storefront pages
│           │
│           └── DashboardPages/           # Dashboard pages
│
└── alejandro-server/                    # Node.js + Express Backend
    │
    ├── .env                             # Server environment variables
    ├── index.js                         # Server entry point
    ├── package.json
    ├── vercel.json                      # Deployment configuration
    │
    ├── config/                          # Server configuration
    │
    ├── middleware/                      # Authentication and authorization
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    │
    ├── models/                          # Mongoose database schemas
    │   ├── userModel.js
    │   ├── productModel.js
    │   ├── categoryModel.js
    │   ├── cartModel.js
    │   ├── orderModel.js
    │   └── reviewModel.js
    │
    ├── controllers/                     # Business logic
    │   ├── userController.js
    │   ├── productController.js
    │   ├── categoryController.js
    │   ├── cartController.js
    │   ├── orderController.js
    │   └── reviewController.js
    │
    └── routes/                          # Express API routes
        ├── userRoutes.js
        ├── productRoutes.js
        ├── categoryRoutes.js
        ├── cartRoutes.js
        ├── orderRoutes.js
        └── reviewRoutes.js
```

---

## 7. Project Setup and Installation

### Server Setup

Navigate to the server directory:

```bash
cd alejandro-server
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `alejandro-server` directory:

```env
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000
```

Start the development server:

```bash
npm run dev
```

The server will run on:

```text
http://localhost:8000
```

### Client Setup

Navigate to the client directory:

```bash
cd alejandro-client
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `alejandro-client` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

The Vite development server will provide a local URL, normally:

```text
http://localhost:5173
```

---

## 8. Client-Server Communication Flow

The basic communication flow of the application is:

```text
User
  │
  ▼
React Client
  │
  │ Axios HTTP Request
  ▼
Express REST API
  │
  ▼
Controller
  │
  ▼
Mongoose Model
  │
  ▼
MongoDB
  │
  │ Database Response
  ▼
Express Server
  │
  │ JSON Response
  ▼
React Client
  │
  ▼
User Interface
```

For example, when a user opens the product page:

```text
Product Page
     │
     ▼
ProductService.js
     │
     ▼
GET /api/product
     │
     ▼
Product Route
     │
     ▼
Product Controller
     │
     ▼
Product Model
     │
     ▼
MongoDB
     │
     ▼
JSON Response
     │
     ▼
React Product Page
```

This architecture separates the user interface, API communication, business logic, and database operations.

---

## 9. Environment Variables

Environment variables are used to prevent sensitive configuration information from being hard-coded into the application.

### Client

```env
VITE_API_URL=http://localhost:8000/api
```

### Server

```env
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000
```

The `.env` files should not be committed to GitHub when they contain private credentials.

---

## 10. Summary

BulldogEx Shop uses a full-stack architecture that separates the React frontend from the Node.js/Express backend.

The **client-side application** focuses on the user interface, routing, state management, and API communication.

The **server-side application** handles authentication, authorization, business logic, database operations, and REST API services.

The separation of the client and server improves maintainability, scalability, security, and organization of the application.

The project applies **Component-Based Architecture, Service Layer Pattern, Context/Provider Pattern, MVC Architecture, and Middleware Pattern** to organize the application and separate different responsibilities.
