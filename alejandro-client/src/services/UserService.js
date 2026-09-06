import axios from 'axios';
import constants from '../constants';

// API Access to Front-end JSON data transformation or decoder
const API = axios.create({
    baseURL: `${constants.HOST}/users`,
});

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// Fetch users
export const fetchUsers = (user) => API.get('/', user);

// Create user
export const createUser = (user) => API.post('/', user);

// Update user
export const updateUser = (id, user) => API.put(`/${id}`, user, getAuthHeaders());

// Delete user
export const deleteUser = (id) => API.delete(`/${id}`, getAuthHeaders());

// Login user
export const loginUser = (credentials) => API.post('/login', credentials);

// Change password (Added to fix the missing export error)
export const changePassword = (id, passwordData) => API.patch(`/${id}/password`, passwordData, getAuthHeaders());