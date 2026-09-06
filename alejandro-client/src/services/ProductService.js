import axios from 'axios';
import constants from '../constants';

const PRODUCT_API = axios.create({
  baseURL: `${constants.HOST}/v1/products`, // Matches app.use("/api/v1/products", productRoutes)
});

const CATEGORY_API = axios.create({
  baseURL: `${constants.HOST}/categories`, // Matches app.use("/api/categories", categoryRoutes)
});

export const fetchProducts = (params = {}) =>
  PRODUCT_API.get('/', { params });

export const fetchProductById = (id) =>
  PRODUCT_API.get(`/${id}`);

export const fetchProductsBySeller = (sellerId) =>
  PRODUCT_API.get(`/seller/${sellerId}`);

export const createProduct = (product) =>
  PRODUCT_API.post('/', product);

export const updateProduct = (id, product) =>
  PRODUCT_API.patch(`/${id}`, product);

export const deleteProduct = (id) =>
  PRODUCT_API.delete(`/${id}`);

export const fetchCategories = () =>
  CATEGORY_API.get('/');