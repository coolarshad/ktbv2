// src/axiosConfig.js
import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const instance = axios.create({
    baseURL: `${BACKEND_URL}`, // Replace with your API base URL
    // timeout: 1000,
    // headers: { 'Content-Type': 'application/json' }
});

// You can set up interceptors here if needed
// instance.interceptors.request.use(function (config) {
//     // Do something before request is sent
//     return config;
// }, function (error) {
//     // Do something with request error
//     return Promise.reject(error);
// });

// instance.interceptors.response.use(function (response) {
//     // Do something with response data
//     return response;
// }, function (error) {
//     // Do something with response error
//     return Promise.reject(error);
// });

export default instance;
