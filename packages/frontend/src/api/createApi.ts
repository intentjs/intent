import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { io, Socket } from 'socket.io-client';
import type { ApiConfig, ApiResponse, ApiError } from '../types';

export interface Api {
  http: AxiosInstance;
  ws: Socket | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  request: <T = any>(config: AxiosRequestConfig) => Promise<ApiResponse<T>>;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
}

export function createApi(config: ApiConfig = {}): Api {
  const {
    baseURL = '/api',
    timeout = 30000,
    headers = {},
    withCredentials = true,
    websocket = { enabled: false },
  } = config;

  // Create HTTP client
  const http = axios.create({
    baseURL,
    timeout,
    headers,
    withCredentials,
  });

  // Create WebSocket client
  let ws: Socket | null = null;

  const api: Api = {
    http,
    ws: null,

    async connect() {
      if (websocket.enabled) {
        ws = io(baseURL, {
          path: websocket.path || '/socket.io',
          withCredentials,
        });

        return new Promise<void>((resolve) => {
          ws?.on('connect', () => {
            console.log('WebSocket connected');
            resolve();
          });
        });
      }
    },

    async disconnect() {
      if (ws) {
        ws.disconnect();
        ws = null;
      }
    },

    async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
      try {
        const response = await http.request<T>(config);
        return {
          data: response.data,
          status: response.status,
          headers: response.headers as Record<string, string>,
        };
      } catch (error: any) {
        const apiError: ApiError = {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          status: error.response?.status || 500,
          details: error.response?.data,
        };
        throw apiError;
      }
    },

    emit(event: string, data?: any) {
      if (ws) {
        ws.emit(event, data);
      }
    },

    on(event: string, callback: (data: any) => void) {
      if (ws) {
        ws.on(event, callback);
      }
    },
  };

  return api;
}

export default createApi; 