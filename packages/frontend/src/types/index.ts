import type { ReactNode, ComponentType } from 'react';

export interface AppConfig {
  store?: StoreConfig;
  api?: ApiConfig;
  ssr?: SSRConfig;
}

export interface StoreConfig {
  initialState?: Record<string, any>;
  middleware?: any[];
  devTools?: boolean;
}

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  websocket?: {
    enabled: boolean;
    path?: string;
  };
}

export interface SSRConfig {
  enabled: boolean;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
  streaming?: boolean;
}

export interface Plugin {
  (context: {
    store: any;
    api: any;
    ssr: any;
  }): void | Promise<void>;
}

export interface ComponentConfig {
  name: string;
  props?: Record<string, any>;
  children?: ReactNode;
}

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  exact?: boolean;
  auth?: boolean;
  roles?: string[];
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
} 