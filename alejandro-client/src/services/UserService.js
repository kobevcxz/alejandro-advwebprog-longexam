import axios from 'axios';
import constants from '../constants';

const API = axios.create({
    baseURL: `${constants.HOST}/users`,
});

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchUsers = () => API.get('/', getAuthHeaders());

export const createUser = (user) => API.post('/', user);

export const updateUser = (id, user) => API.put(`/${id}`, user, getAuthHeaders());

export const deleteUser = (id) => API.delete(`/${id}`, getAuthHeaders());

export const loginUser = (credentials) => API.post('/login', credentials);

export const changePassword = (id, passwordData) => API.patch(`/${id}/password`, passwordData, getAuthHeaders());