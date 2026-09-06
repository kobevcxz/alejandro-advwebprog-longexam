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

After pasting this into your `README.md` and saving, just run these terminal commands to push the fix:
```bash
git add README.md
git commit -m "Fix README formatting"
git push origin main