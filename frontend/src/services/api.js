import axios from "axios";

// 1. Point Axios to your Express backend
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 2. Automatically attach the Auth Token to every request
api.interceptors.request.use(
  (config) => {
    // Look inside the browser's local storage for a saved login token
    const token = localStorage.getItem("token");

    // If a token exists, tape it to the authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
