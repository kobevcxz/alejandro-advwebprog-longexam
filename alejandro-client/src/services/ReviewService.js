import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reviews';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchAllReviews = async () => {
  return axios.get(API_URL, getAuthHeaders());
};

export const fetchProductReviews = async (productId) => {
  return axios.get(`${API_URL}/product/${productId}`);
};

export const fetchReviewsBySeller = async (sellerId) => {
  return axios.get(`${API_URL}/seller/${sellerId}`, getAuthHeaders());
};

export const fetchProductsToReview = async (userId) => {
  return axios.get(`${API_URL}/to-review/${userId}`, getAuthHeaders());
};

export const fetchMyReviews = async (userId) => {
  return axios.get(`${API_URL}/my-reviews/${userId}`, getAuthHeaders());
};

export const createReview = async (productId, reviewData) => {
  return axios.post(`${API_URL}/${productId}`, reviewData, getAuthHeaders());
};

export const updateReview = async (reviewId, reviewData) => {
  return axios.put(`${API_URL}/${reviewId}`, reviewData, getAuthHeaders());
};