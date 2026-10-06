import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenMemory = token;
};

export const getAccessToken = () => accessTokenMemory;

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (accessTokenMemory) {
      config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        if (refreshResponse.data?.success && refreshResponse.data?.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken;
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        setAccessToken(null);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
