import axios from 'axios';
import constants from '../constants';

const API_URL = `${constants.HOST}/orders`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Admin/Seller: Fetch all orders for the dashboard
export const fetchDashboardOrders = async (role, userId, params) => {
  return axios.get(`${API_URL}/dashboard`, { 
    ...getAuthHeaders(), 
    params 
  });
};

// Professional alias export for generalized fetching (used by HomePage, etc.)
export const fetchAllOrders = async (params) => {
  return axios.get(`${API_URL}`, { 
    ...getAuthHeaders(), 
    params 
  });
};

// Customer: Fetch user's specific orders
export const fetchMyOrders = async (userId) => {
  return axios.get(`${API_URL}/user/${userId}`, getAuthHeaders());
};

// Customer: Cancel an order
export const cancelOrder = async (orderId) => {
  return axios.delete(`${API_URL}/${orderId}`, getAuthHeaders());
};

// Customer: Checkout cart and create an order
export const checkoutCart = async (userId, checkoutData) => {
  const payload = {
    buyer: userId,
    products: checkoutData.products,
    totalAmount: checkoutData.totalAmount,
    shippingAddress: checkoutData.shippingAddress,
    paymentMethod: checkoutData.paymentMethod
  };
  return axios.post(`${API_URL}`, payload, getAuthHeaders());
};

// Update order status (Matched to backend PUT /:id/status route)
export const updateOrderStatus = async (orderId, orderStatus) => {
  return axios.put(`${API_URL}/${orderId}/status`, { orderStatus }, getAuthHeaders());
};