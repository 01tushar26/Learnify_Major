import axios from 'axios';
import { toast, Toaster } from "sonner";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

//todo-add the url in env
const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // sends the refreshToken HttpOnly cookie automatically
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach the accessToken to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
     const isAuthRoute = config.url?.startsWith('/auth/');
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isAuthRoute) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — try refresh, else redirect to login
axiosInstance.interceptors.response.use(
  (response) => {
    //todo-remove that
    
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
        console.log("error", error);
    
    if (originalRequest.url.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true; // prevent infinite loop

      try {
        console.log("Access token expired, attempting refresh...");
        const res = await axiosInstance.post('/auth/refresh');

        localStorage.setItem('accessToken', res.data.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${res.data.data.accessToken}`;
        
        return axiosInstance(originalRequest); // retry original request

      } catch (err) {

        localStorage.removeItem('accessToken');
       toast.error("Please login first !!", {
          description: "Session expired or invalid. Redirecting to landing page.",
        });

         setTimeout(() =>  window.location.href = `${import.meta.env.VITE_CLIENT_URL}`, 1100)
       
         return new Promise(() => {})
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

