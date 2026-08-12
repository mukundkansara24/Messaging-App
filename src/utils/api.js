import axios from 'axios';

// In production, uses the live backend URL.
// In development, falls back to '' so the Vite proxy handles '/api'.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    withCredentials: true, // Enables cookie sharing across production domains
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log(error.response);
        const isLoginPage = window.location.pathname === '/login';
        if (!isLoginPage && error.response && (error.response.status === 400 || error.response.status === 401)) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;