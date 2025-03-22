import { IntentConfiguration } from "./interface.js";

export const DEFAULT_INTENT_CONFIG = (): IntentConfiguration => {
  return {
    sourceRoot: "app",
    serverBootFile: "server",
    debug: true,
    buildOptions: { deleteOutDir: true },
    metaFiles: ["package.json"],
    watchMetaFiles: true,
    typeCheck: true,
    watch: true,
  };
};
