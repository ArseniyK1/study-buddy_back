import axios from "axios";

const api = () => {
  const config = useRuntimeConfig();
  const api = axios.create({
    baseURL: config.public.apiBase,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export default api;
