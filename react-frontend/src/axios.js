// axios.js
import axios from 'axios';
import { startProgress, stopProgress } from './progress';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://react-laravel-production-232e.up.railway.app/api'
    : 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    startProgress();
    
    // Debug logging
    console.log('🚀 API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      withCredentials: config.withCredentials,
      data: config.data
    });

    // Log current cookies
    console.log('🍪 Current cookies:', document.cookie || 'No cookies found');

    // Check for JWT token in cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = value;
      return acc;
    }, {});

    const jwtToken = cookies.jwt_token;
    console.log('🎯 JWT Token in cookie:', jwtToken ? 'FOUND' : 'NOT FOUND');

    // If no JWT token in cookie, try localStorage as fallback
    if (!jwtToken) {
      const fallbackToken = localStorage.getItem('jwt_token');
      if (fallbackToken) {
        console.log('🔄 Using fallback token from localStorage');
        config.headers.Authorization = `Bearer ${fallbackToken}`;
      }
    }

    return config;
  },
  (error) => {
    stopProgress();
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    stopProgress();
    
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
      headers: response.headers
    });

    // Check if response contains a token and store it as fallback
    if (response.data?.token) {
      console.log('💾 Storing token in localStorage as fallback');
      localStorage.setItem('jwt_token', response.data.token);
    }

    return response;
  },
  (error) => {
    stopProgress();
    
    const errorInfo = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    };

    console.error('❌ API Response Error:', errorInfo);

    // If 401 and we have a fallback token, try once more
    if (error.response?.status === 401 && !error.config._retry) {
      const fallbackToken = localStorage.getItem('jwt_token');
      
      if (fallbackToken && !error.config.headers.Authorization) {
        console.log('🔄 Retrying with fallback token from localStorage');
        
        error.config._retry = true;
        error.config.headers.Authorization = `Bearer ${fallbackToken}`;
        
        return api.request(error.config);
      }
    }

    // If still 401, clear any stored tokens
    if (error.response?.status === 401) {
      console.log('🗑️ Clearing tokens due to 401 error');
      localStorage.removeItem('jwt_token');
      
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        console.log('🔄 Redirecting to login due to authentication failure');
        // window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for debugging
export const debugCookies = () => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});
  
  console.log('🔍 Cookie Debug:', {
    allCookies: cookies,
    jwtTokenExists: !!cookies.jwt_token,
    jwtTokenPreview: cookies.jwt_token ? cookies.jwt_token.substring(0, 30) + '...' : null,
    cookieString: document.cookie
  });
  
  return cookies;
};

export const debugRequest = async (endpoint = '/debug/request') => {
  try {
    console.log('🧪 Testing basic connectivity...');
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('🧪 Basic connectivity test failed:', error);
    throw error;
  }
};

export const testLogin = async (credentials) => {
  try {
    console.log('🧪 Testing login...');
    debugCookies(); // Check cookies before login
    
    const response = await api.post('/login', credentials);
    
    setTimeout(() => {
      debugCookies(); // Check cookies after login
    }, 100);
    
    return response.data;
  } catch (error) {
    console.error('🧪 Login test failed:', error);
    throw error;
  }
};

export const testProtectedRoute = async () => {
  try {
    console.log('🧪 Testing protected route...');
    debugCookies(); // Check cookies before request
    
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('🧪 Protected route test failed:', error);
    throw error;
  }
};

// Manual cookie management (use if automatic cookies fail)
export const setTokenManually = (token) => {
  console.log('🔧 Setting token manually in localStorage');
  localStorage.setItem('jwt_token', token);
};

export const clearTokens = () => {
  console.log('🗑️ Clearing all tokens');
  localStorage.removeItem('jwt_token');
  // Note: Can't manually clear httpOnly cookies from JS
};



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