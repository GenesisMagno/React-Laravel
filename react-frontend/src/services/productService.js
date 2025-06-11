import api from '../axios';

export const getProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateProduct = async ({ id, formData }) => {
    const { data } = await api.post(`/products/${id}`, formData);
    return data;
};



export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// Fixed the searchProduct function
export const searchProduct = async (searchTerm) => {
  const { data } = await api.get(`/products/search?q=${searchTerm}`);
  return data;
};