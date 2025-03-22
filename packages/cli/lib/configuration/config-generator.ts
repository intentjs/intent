import { IntentConfiguration } from "./interface.js";

export const defineConfig = (config: Omit<IntentConfiguration, "watch">) => {
  return { ...config };
};
