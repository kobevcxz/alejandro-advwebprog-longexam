import axios from 'axios';
import constants from '../constants';

const PRODUCT_API = axios.create({
  baseURL: `${constants.HOST}/v1/products`,
});

const CATEGORY_API = axios.create({
  baseURL: `${constants.HOST}/categories`,
});

const getAuthConfig = () => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

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

export const uploadProductImage = (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  return PRODUCT_API.post(
    `/${id}/upload-image`,
    formData,
    getAuthConfig()
  );
};

export const replaceProductImage = (id, imageIndex, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  return PRODUCT_API.patch(
    `/${id}/images/${imageIndex}`,
    formData,
    getAuthConfig()
  );
};

export const deleteProductImage = (id, imageIndex) =>
  PRODUCT_API.delete(
    `/${id}/images/${imageIndex}`,
    getAuthConfig()
  );

export const fetchCategories = () =>
  CATEGORY_API.get('/');