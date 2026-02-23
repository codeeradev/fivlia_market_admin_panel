// src/apis/apiClient.ts
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getAdminToken } from "@/utils/adminAuth";

// const BASE_URL = import.meta.env.VITE_API_URL || "https://marketapi.fivlia.co.in" || "http://172.93.223.239:8090";
const BASE_URL = "http://localhost:8090";
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

// GET
export const get = async <TResponse>(
  url: string,
  params?: Record<string, unknown>
): Promise<TResponse> => {
  const res: AxiosResponse<TResponse> = await api.get(url, { params });
  return res.data;
};

// POST
export const post = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  const res: AxiosResponse<TResponse> = await api.post(url, data, config);
  return res.data;
};

// PUT
export const put = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  const res: AxiosResponse<TResponse> = await api.put(url, data, config);
  return res.data;
};

// PATCH
export const patch = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  const res: AxiosResponse<TResponse> = await api.patch(url, data, config);
  return res.data;
};

// DELETE
export const del = async <TResponse>(url: string): Promise<TResponse> => {
  const res: AxiosResponse<TResponse> = await api.delete(url);
  return res.data;
};

export default api;
