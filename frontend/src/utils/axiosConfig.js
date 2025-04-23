import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      if (error.response.status === 401) {
        // Only handle token expiration or invalid token
        if (error.response.data?.message?.includes('token') || 
            error.response.data?.message?.includes('authentication')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || error);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.'
      });
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
      return Promise.reject({
        message: 'An error occurred while setting up the request.'
      });
    }
  }
);

export default axiosInstance; 