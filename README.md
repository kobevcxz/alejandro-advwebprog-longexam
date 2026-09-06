# CTWEBPGL Web Programming - Long Exam 1

This repository contains **BulldogEx Shop**, a campus-focused e-commerce website built with a **React (Vite) client** and a **Node.js/Express + MongoDB server**.

The website provides product browsing, product details, store information, authentication pages, reusable components, and a backend API for user management and authentication.

## Features

- Full-width e-commerce hero section
- Product catalog with reusable product cards
- Product detail pages
- Product categories, prices, stock status, descriptions, and images
- Store home page
- About page
- Footer and navigation components
- Sign In page
- Sign Up page
- User registration API
- User login API
- User update and delete API
- MongoDB database connection
- Password hashing using bcryptjs
- JWT authentication
- Client-side routing using React Router

## 1. Client-Server Integration

The project is separated into two applications:

    alejandro-advwebprog/
    ├── alejandro-client/
    └── alejandro-server/

The **client** is responsible for the website interface, page navigation, product presentation, and authentication pages.

The **server** is responsible for the backend API, user management, authentication, password hashing, JWT generation, and MongoDB communication.

### API Routing

The Express server is configured in `alejandro-server/index.js`.

The server mounts the following routes:

    /api/users
    /api/articles

The user routes provide the following API operations:

    GET    /api/users
    POST   /api/users
    PUT    /api/users/:id
    DELETE /api/users/:id
    POST   /api/users/login

The articles route provides:

    GET /api/articles

The Express server uses CORS to allow communication between the client and server applications.

### User Registration

The server provides the registration endpoint:

    POST /api/users

The request is handled by `createUser` inside:

    alejandro-server/controllers/userController.js

Before the user is stored in MongoDB, the password is hashed using `bcryptjs`.

The user data is then stored through the Mongoose `User` model.

### User Login

The server provides the login endpoint:

    POST /api/users/login

The login process searches for the user using the provided email, checks whether the account is active, checks the account type, compares the submitted password with the stored hashed password, and generates a JWT token after successful authentication.

The JWT token contains the user's ID, email, and account type and expires after one hour.

The client contains the corresponding authentication pages:

    alejandro-client/src/pages/AuthPages/SignInPage.jsx
    alejandro-client/src/pages/AuthPages/SignUpPage.jsx

These pages provide the Sign In and Sign Up user interface, while the authentication logic is implemented on the server.

### Database Integration

The server connects to MongoDB using Mongoose.

The database connection is located in:

    alejandro-server/config/db.js

The connection uses the `MONGO_URI` environment variable.

The server configuration is located in:

    alejandro-server/config/config.js

The configuration includes:

    MONGO_URI
    PORT
    JWT_SECRET
    NODE_ENV

### Product Integration

The product information used by the client is stored in:

    alejandro-client/src/assets/product-content.js

The product list page imports the product data and passes it to the `ProductList` component.

The product detail page uses the product name from the URL to find the corresponding product from the product data.

---

## 2. Client Libraries and Packages

The client is built using React and Vite.

### React

`react` is used to build the user interface using reusable components.

### React DOM

`react-dom` is used to render the React application.

### React Router DOM

`react-router-dom` is used for client-side routing.

The route configuration is defined in:

    alejandro-client/src/App.jsx

The current routes are:

    /                    - Home page
    /about               - About page
    /products            - Product list page
    /products/:name      - Product detail page
    /auth/signin         - Sign In page
    /auth/signup         - Sign Up page

### Tailwind CSS

`tailwindcss` is used to style the client application using utility classes.

The project also uses `@tailwindcss/vite` for Tailwind CSS integration with Vite.

### Vite

Vite is used as the development server and build tool for the React application.

### ESLint

ESLint is used for linting the client-side code.

The client also uses:

    @eslint/js
    @types/react
    @types/react-dom
    @vitejs/plugin-react
    eslint
    eslint-plugin-react-hooks
    eslint-plugin-react-refresh
    globals
    vite

---

## 3. Server Libraries and Packages

The server is built using Node.js and Express.

### Express

`express` is used to create the backend server and REST API.

It handles HTTP requests, middleware, routes, and responses.

### Mongoose

`mongoose` is used to connect the server to MongoDB and define the User schema.

The User model is located in:

    alejandro-server/models/User.js

### bcryptjs

`bcryptjs` is used to hash passwords before they are stored in MongoDB.

It is also used to compare the submitted password with the stored hashed password during login.

### JSON Web Token

`jsonwebtoken` is used to generate JWT authentication tokens after successful login.

### CORS

`cors` is used to allow communication between the client and server applications.

### Body Parser

`body-parser` is used to parse JSON and URL-encoded request bodies.

### dotenv

`dotenv` is used to load environment variables from the `.env` file.

### Nodemon

`nodemon` is included as a development dependency and automatically restarts the server when changes are detected.

---

## 4. Design Patterns

### Client Design Pattern

The client follows a **Component-Based Architecture**.

The user interface is divided into reusable components:

    components/
    ├── Button.jsx
    ├── Footer.jsx
    ├── NavBar.jsx
    ├── ProductCard.jsx
    └── ProductList.jsx

Each component is responsible for a specific part of the user interface.

The client also uses a **Layout Pattern**.

The main website pages use:

    layouts/Layout.jsx

The authentication pages use:

    layouts/AuthLayout.jsx

The `Layout` component provides the shared structure for the main website pages, while `AuthLayout` provides the structure for the authentication pages.

The product data is separated from the presentation components and stored in:

    assets/product-content.js

The product information is displayed using:

    ProductList.jsx
    ProductCard.jsx

This structure keeps the product data separate from the components that display it and allows the components to be reused.

### Server Design Pattern

The server follows an **MVC-style structure** by separating the model, controller, and route responsibilities.

The server is organized into:

    config/
    controllers/
    models/
    routes/

### Model

The model defines the database structure.

The project uses:

    models/User.js

The `User` model defines the structure and validation rules for user information stored in MongoDB.

### Controller

The controller contains the application logic for user operations.

The project uses:

    controllers/userController.js

The controller handles:

- Getting users
- Creating users
- Updating users
- Deleting users
- Logging users in

### Routes

The routes define the API endpoints and connect them to the controller functions.

The project uses:

    routes/userRoutes.js
    routes/articleRoutes.js

The route files handle the API paths while the controller handles the application logic.

This separation makes the server structure more organized and keeps routing, database models, and application logic in separate files.

---

## 5. Client File Outline

    alejandro-client/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── vite.config.js
    │
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    └── src/
        ├── App.jsx
        ├── main.jsx
        │
        ├── assets/
        │   ├── hero.png
        │   ├── product-content.js
        │   ├── react.svg
        │   ├── vite.svg
        │   │
        │   ├── img/
        │   │   ├── idk.jpg
        │   │   ├── nu_bulldogex_banner.jpg
        │   │   ├── nu_cap.png
        │   │   ├── nu_champ_shirt.png
        │   │   ├── nu_classic_v2_sticker.png
        │   │   ├── nu_keychain.png
        │   │   ├── nu_lanyard.png
        │   │   ├── nu_v1_scarf.png
        │   │   ├── nu_varsity_jacket.png
        │   │   ├── nu_volleyball_sticker.png
        │   │   ├── nubdexchange_logo.png
        │   │   └── signInn.jpg
        │   │
        │   └── styles/
        │       └── index.css
        │
        ├── components/
        │   ├── Button.jsx
        │   ├── Footer.jsx
        │   ├── NavBar.jsx
        │   ├── ProductCard.jsx
        │   └── ProductList.jsx
        │
        ├── layouts/
        │   ├── AuthLayout.jsx
        │   └── Layout.jsx
        │
        └── pages/
            ├── NotFoundPage.jsx
            │
            ├── AuthPages/
            │   ├── SignInPage.jsx
            │   └── SignUpPage.jsx
            │
            └── LandingPages/
                ├── AboutPage.jsx
                ├── HomePage.jsx
                ├── ProductListPage.jsx
                └── ProductPage.jsx

---

## 6. Server File Outline

    alejandro-server/
    ├── .env
    ├── index.js
    ├── package.json
    ├── package-lock.json
    ├── vercel.json
    │
    ├── config/
    │   ├── config.js
    │   └── db.js
    │
    ├── controllers/
    │   └── userController.js
    │
    ├── middleware/
    │
    ├── models/
    │   └── User.js
    │
    └── routes/
        ├── articleRoutes.js
        └── userRoutes.js

---

## 7. Project Setup

### Client

Go to the client directory:

    cd alejandro-client

Install the dependencies:

    npm install

Start the development server:

    npm run dev

Create a production build:

    npm run build

Run ESLint:

    npm run lint

Preview the production build:

    npm run preview

### Server

Go to the server directory:

    cd alejandro-server

Install the dependencies:

    npm install

Start the server:

    npm start

Run the server in development mode:

    npm run dev

The server uses port `8000` by default.

---

## 8. Environment Variables

The server uses the following environment variables:

    MONGO_URI
    PORT
    JWT_SECRET
    NODE_ENV

Example:

    MONGO_URI=<your-mongodb-connection-string>
    PORT=8000
    JWT_SECRET=<your-jwt-secret>
    NODE_ENV=development

The `.env` file contains environment configuration and should not be exposed in a public repository.

---

## 9. Summary

BulldogEx Shop uses a separated client-server architecture.

The **client** is responsible for the user interface, routing, layouts, reusable components, product catalog, product details, and authentication pages. It uses React, React DOM, React Router DOM, Vite, Tailwind CSS, and ESLint.

The **server** is responsible for the REST API, MongoDB connection, user management, password hashing, and JWT authentication. It uses Express, Mongoose, bcryptjs, JSON Web Token, CORS, Body Parser, dotenv, and Nodemon.

The client follows a **Component-Based Architecture** with reusable components and layouts, while the server follows an **MVC-style structure** using models, controllers, and routes. This separation provides an organized structure for the client interface and backend API.