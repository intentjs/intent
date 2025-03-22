import { IntentConfiguration } from "../../configuration/interface.js";
import type { Options } from "@swc/core";

export const BASE_SWC_OPTIONS = (): Options => {
  return {
    module: {
      type: "es6",
      strict: true,
      noInterop: false,
      // exportType: "preserve-import",
    },
    jsc: {
      target: "es2022",
      parser: {
        syntax: "typescript",
        tsx: true,
        decorators: true,
        dynamicImport: true,
      },
      preserveAllComments: true,
    },
    minify: false,
    swcrc: true,
  };
};

export const defaultSwcOptionsFactory = (
  tsOptions: Record<string, any>,
  configuration: IntentConfiguration
): Options => {
  return {
    sourceMaps:
      tsOptions?.compilerOptions?.sourceMap ||
      (tsOptions?.inlineSourceMap && "inline"),
    module: {
      type: "es6",
      strict: true,
      noInterop: false,
      // exportType: "preserve-import",
    },
    exclude: ["node_modules", "dist"],
    jsc: {
      target: "es2022",
      parser: {
        syntax: "typescript",
        tsx: true,
        decorators: true,
        dynamicImport: true,
      },
      transform: {
        react: { runtime: "automatic" },
        legacyDecorator: true,
        decoratorMetadata: true,
        useDefineForClassFields: false,
      },
      keepClassNames: true,
      baseUrl: tsOptions?.compilerOptions?.baseUrl,
      paths: tsOptions?.compilerOptions?.paths,
      preserveAllComments: true,
    },
    minify: false,
    swcrc: true,
  };
};
