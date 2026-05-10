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
    function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response && error.response.status === 401) {
            // Unauthorized, maybe token expired
            // Clear local storage and redirect to login if not already on login page
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
