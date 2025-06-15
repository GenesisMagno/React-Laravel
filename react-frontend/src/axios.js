// In axios.js
import axios from 'axios';
import { startProgress, stopProgress } from './progress';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
});

let requestCount = 0;

function begin() {
  if (requestCount === 0) startProgress();
  requestCount++;
}

function end() {
  requestCount = Math.max(requestCount - 1, 0);
  if (requestCount === 0) stopProgress();
}

api.interceptors.request.use(config => {
  begin();
  return config;
}, error => {
  end();
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  end();
  return response;
}, error => {
  end();
  return Promise.reject(error);
});

export default api;