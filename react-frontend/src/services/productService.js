import api from '../axios';

export const getProducts = async (page, perPage, search ) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('per_page', perPage);
  if (search) params.append('q', search); // Add this only if search is provided
  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
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

export const deleteIngredient = async (product,ingredient) => {
  const { data } = await api.delete(`/products/${product}/ingredients/${ingredient}`);
  return data;
};



