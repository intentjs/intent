import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { StoreConfig } from '../types';

export interface Store {
  state: Record<string, any>;
  setState: (state: Partial<Record<string, any>>) => void;
  reset: () => void;
}

export function createStore(config: StoreConfig = {}) {
  const { initialState = {}, middleware = [], devTools = true } = config;

  const useStore = create<Store>()(
    devtools(
      persist(
        (set) => ({
          state: initialState,
          setState: (newState) =>
            set((state) => ({
              state: { ...state.state, ...newState },
            })),
          reset: () =>
            set({
              state: initialState,
            }),
        }),
        {
          name: 'intent-store',
        }
      ),
      {
        enabled: devTools,
        name: 'Intent Store',
      }
    )
  );

  // Apply custom middleware
  middleware.forEach((middlewareFn) => middlewareFn(useStore));

  return useStore;
}

export default createStore; 