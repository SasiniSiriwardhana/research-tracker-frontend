import axios from 'axios';

// ============================================================
// Axios Instance Configuration
// Base URL targets the Spring Boot backend on port 8081
// ============================================================
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================================
// Request Interceptor: Attach JWT Bearer token to every request
// ============================================================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor: Handle 401 Unauthorized globally
// If token is expired or invalid, clear storage and redirect to login
// ============================================================
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we are not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
