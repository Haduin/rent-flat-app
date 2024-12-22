import type {AxiosInstance} from 'axios';
import axios from 'axios';

export const apiClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Podstawowy URL API
    timeout: 10000,                     // Timeout w milisekundach (opcjonalnie)
    headers: {                          // Nagłówki domyślne (opcjonalnie)
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

