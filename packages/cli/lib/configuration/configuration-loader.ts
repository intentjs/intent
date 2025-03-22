import { IntentConfiguration } from "./interface.js";
import { join, resolve } from "path";
import { DEFAULT_INTENT_CONFIG } from "./default-configuration.js";
import { assign } from "radash";
import { INTENT_LOG_PREFIX } from "../utils/log-helpers.js";
import pc from "picocolors";
import { SwcTransformer } from "../dev-server/swc/swc-transformer.js";
import { ParsedCommandLine } from "typescript";
import { ExtraOptions } from "../interfaces.js";

export class ConfigurationLoader {
  private swcTransformer = new SwcTransformer();

  async load(
    filePath: string,
    tsConfig: ParsedCommandLine,
    cliOptions: ExtraOptions
  ): Promise<IntentConfiguration> {
    try {
      const intentrcPath = this.loadPath(filePath);
      const tempIntentRcPath = await this.swcTransformer.transpileTemp(
        intentrcPath,
        "intentrc.js",
        tsConfig
      );

      const { default: intentConfig } = await import(
        `file://${tempIntentRcPath}`
      );

      const defaultConfig = DEFAULT_INTENT_CONFIG();
      intentConfig.metaFiles = [
        ...(defaultConfig.metaFiles || []),
        ...(intentConfig.metaFiles || []),
      ];

      const shallowConfig = assign(
        assign(DEFAULT_INTENT_CONFIG(), intentConfig),
        cliOptions
      );

      shallowConfig.serverBootFile = resolve(
        tsConfig.options.outDir as string,
        "bin",
        ...shallowConfig.serverBootFile.split("/")
      );

      if (shallowConfig.metaFiles.length) {
        const { watchMetaFiles, metaFiles } = shallowConfig;
        shallowConfig.metaFiles = metaFiles.map((file: any) => {
          if (typeof file === "string") {
            return { path: file, watch: watchMetaFiles };
          }

          if (typeof file === "object") {
            return file;
          }

          return file;
        });
      }

      return shallowConfig;
      return shallowConfig;
    } catch (e) {
      console.log(e);
      console.log(INTENT_LOG_PREFIX, pc.red(e.message));
      process.exit();
    }
  }

  loadPath(path?: string) {
    return join(process.cwd(), path || "intentrc.ts");
  }
}
