// src/axiosConfig.js
import axios from 'axios';
import { BASE_URL } from './utils';
const BACKEND_URL = BASE_URL || "http://localhost:8000";

const instance = axios.create({
    baseURL: BACKEND_URL, // Replace with your API base URL
    // timeout: 1000,
    // headers: { 'Content-Type': 'application/json' }
});

// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    async function (error) {
        const originalRequest = error.config;
        
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (refreshToken) {
                try {
                    // Use standard axios to avoid interceptor loop
                    const response = await axios.post(`${BACKEND_URL}/api/token/refresh/`, {
                        refresh: refreshToken
                    });
                    
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);
                    
                    // Update header for the retry
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    return instance(originalRequest);
                } catch (refreshError) {
                    // Refresh token is expired or invalid
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
