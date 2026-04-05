import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log(error.response);
        const isLoginPage = window.location.pathname === '/login';
        if (!isLoginPage && (error.response && error.response.status === 400 || error.response.status === 401)) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;