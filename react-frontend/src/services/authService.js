// src/services/authService.js
import api from '../axios';

export const login = async (credentials) => {
  const { data } = await api.post('/login', credentials);
  return data.user;
};


export const register = async (formData) => {
  await api.post('/register', formData); // no return
};

export const logout = async () => {
  await api.post('/logout');
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/user');
  return data;
};
