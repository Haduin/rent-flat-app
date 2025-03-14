import type {AxiosInstance} from 'axios';
import axios from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Podstawowy URL API
    withCredentials: true, // Pozwól na wysyłanie ciasteczek (jeśli używasz cookie do trzymania tokena)

    headers: {                          // Nagłówki domyślne (opcjonalnie)
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }
);
export {apiClient};

