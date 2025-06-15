// src/services/authService.js
import api from '../axios';

export const login = async (credentials) => {
  await api.post('/login', credentials);
  const { data } = await api.get('/user');
  return data;
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
