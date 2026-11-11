import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

export const socket = API_URL
  ? io(API_URL, { autoConnect: false })
  : io({ autoConnect: false });

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export const setupInterceptors = (onUnauthorized: () => void) => {
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
};