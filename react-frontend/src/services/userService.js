import api from '../axios';

export const getUsers = async (page, perPage, search ) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('per_page', perPage);
  if (search) params.append('q', search); // Add this only if search is provided
  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateUser = async ({ id, formData }) => {
    const { data } = await api.post(`/users/${id}`, formData);
    return data;
};


export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
