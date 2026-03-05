import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_URL}/api`,
});

// 2. Automatically attach the Auth Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// Function to fetch a single server by its ID
export const getServerById = async (id) => {
  const response = await api.get(`/servers/${id}`);
  return response.data;
};

// Function to start a server
export const startServer = async (id) => {
  const response = await api.post(`/servers/${id}/start`);
  return response.data;
};

// Function to stop a server
export const stopServer = async (id) => {
  const response = await api.post(`/servers/${id}/action/stop_server`);
  return response.data;
};

export const restartServer = async (id) => {
  const response = await api.post(`/servers/${id}/restart`);
  return response.data;
};

// Function to get live server status
export const getServerStatus = async (id) => {
  const response = await api.get(`/servers/${id}/status`);
  return response.data;
};

// Function to get server logs
export const getServerLogs = async (id) => {
  const response = await api.get(`/servers/${id}/logs`);
  return response.data;
};

// Function to send command to server
export const sendServerCommand = async (id, command) => {
  const response = await api.post(`/servers/${id}/command`, { command });
  return response.data;
};

export const getUserServers = async () => {
  const response = await api.get("/servers");
  return response.data;
};

export const getServerConfig = async (id) => {
  const response = await api.get(`/servers/${id}/config`);
  return response.data;
};

export const saveServerConfig = async (id, config) => {
  const response = await api.patch(`/servers/${id}/config`, config);
  return response.data;
};

// File Manager API functions
export const listServerFiles = async (id, subpath) => {
  const params = subpath ? { path: subpath } : {};
  const response = await api.get(`/servers/${id}/files`, { params });
  return response.data;
};

export const getFileContent = async (id, filepath) => {
  const response = await api.get(`/servers/${id}/files/content`, { params: { path: filepath } });
  return response.data;
};

export const saveFileContent = async (id, filepath, content) => {
  const response = await api.put(`/servers/${id}/files/content`, { filepath, content });
  return response.data;
};

export const deleteServerFile = async (id, filepath) => {
  const response = await api.delete(`/servers/${id}/files`, { params: { path: filepath } });
  return response.data;
};

export const uploadServerFile = async (id, dirpath, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", dirpath || ".");
  const response = await api.post(`/servers/${id}/files/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default api;
