import axios from 'axios';
import constants from '../constants';

const API_URL = `${constants.HOST}/cart`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchCart = async (userId) => {
  return axios.get(`${API_URL}/${userId}`, getAuthHeaders());
};

export const addToCart = async (userId, productId, quantity = 1) => {
  return axios.post(`${API_URL}/${userId}`, { productId, quantity }, getAuthHeaders());
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  return axios.put(`${API_URL}/${userId}/${productId}`, { quantity }, getAuthHeaders());
};

export const removeFromCart = async (userId, productId) => {
  return axios.delete(`${API_URL}/${userId}/${productId}`, getAuthHeaders());
};