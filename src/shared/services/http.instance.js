import axios from "axios";

const httpInstance = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
    },
});

// Interceptor para agregar token a requests
httpInstance.interceptors.request.use(
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

// Interceptor para manejar respuestas
httpInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default httpInstance;