import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from './layouts/Layout';
import ProductPage from './pages/LandingPages/ProductPage';
import HomePage from './pages/LandingPages/HomePage';
import AboutPage from './pages/LandingPages/AboutPage';
import ProductListPage from './pages/LandingPages/ProductListPage';
import CartPage from './pages/LandingPages/CartPage';
import AccountPage from './pages/LandingPages/AccountPage';
import OrderPage from './pages/LandingPages/OrderPage'; // <-- 1. IMPORT YOUR ORDER PAGE HERE
import ReviewPage from './pages/LandingPages/ReviewPage';

import AuthLayout from './layouts/AuthLayout';
import SignInPage from './pages/AuthPages/SignInPage';
import SignUpPage from './pages/AuthPages/SignUpPage';

import DashLayout from './layouts/DashLayout';

import DashboardPage from './pages/DashboardPages/DashboardPage';
import DashProductListPage from './pages/DashboardPages/DashProductListPage';
import DashOrderListPage from './pages/DashboardPages/DashOrderListPage';
import DashReviewPage from './pages/DashboardPages/DashReviewPage';
import UsersPage from './pages/DashboardPages/UsersPage';

import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:name', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'profile', element: <AccountPage /> },
      { path: 'orders', element: <OrderPage /> }, // <-- 2. ADD THE /orders ROUTE HERE
      { path: 'reviews', element: <ReviewPage /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
    ],
  },
  {
    path: '/customer',
    element: <ProtectedRoute allowedRoles={['customer', 'buyer']} />,
    errorElement: <NotFoundPage />,
    children: [
      { path: 'account', element: <AccountPage /> },
      { path: 'profile', element: <AccountPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin', 'seller']} />,
    children: [
      {
        element: <DashLayout />, 
        children: [
          { path: '', element: <DashboardPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'products', element: <DashProductListPage /> },
          { path: 'orders', element: <DashOrderListPage /> },
          { path: 'reviews', element: <DashReviewPage /> },
          { path: 'users', element: <UsersPage /> },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;