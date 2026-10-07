import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

export const socket = io(API_URL, {
  autoConnect: false
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};