import { dirname, join } from "path";
import { defaultSwcOptionsFactory } from "./default-options.js";
import fs from "fs-extra";
import { ExtraOptions } from "../../interfaces.js";
import { SWC_DEBUG_LOG_PREFIX } from "../../utils/log-helpers.js";
import { ParsedCommandLine } from "typescript";
import { Output } from "@swc/core";
import { transformFile } from "@swc/core";
import { IntentConfiguration } from "../../configuration/interface.js";
import { TsConfigLoader } from "../typescript/tsconfig-loader.js";

const { mkdirSync, writeFileSync } = fs;

export class SwcFileTransformer {
  protected readonly tsConfigLoader = new TsConfigLoader();

  async handle(
    tsConfigPath: string,
    INTENT_CONFIG: IntentConfiguration,
    options: ReturnType<typeof defaultSwcOptionsFactory>
  ): Promise<() => Promise<void>> {
    const TS_CONFIG = this.tsConfigLoader.load(tsConfigPath);
    await this.transformFiles(TS_CONFIG, options, INTENT_CONFIG);

    const onUpdate = () => {
      const TS_CONFIG = this.tsConfigLoader.load(tsConfigPath);
      return this.transformFiles(TS_CONFIG, options, INTENT_CONFIG);
    };

    return onUpdate.bind(this);
  }

  async transformFiles(
    TS_CONFIG: ParsedCommandLine,
    options: ReturnType<typeof defaultSwcOptionsFactory>,
    extras: ExtraOptions
  ) {
    const now = Date.now();
    const { fileNames = [] } = TS_CONFIG;
    const isWindows = process.platform === "win32";
    const fileTransformationPromises = [];
    for (const filePath of fileNames) {
      const fileTransformerPromise = (resolve: Function) =>
        transformFile(filePath, { ...options, filename: filePath })
          .then(({ code, map }: Output) => {
            const distFilePath = this.getDistPath(
              isWindows,
              filePath,
              TS_CONFIG.options.outDir as string,
              TS_CONFIG.options.baseUrl as string
            );

            const codeFilePath = join(
              process.cwd(),
              distFilePath.replace(/\.ts$/, ".js").replace(/\.tsx$/, ".js")
            );

            const osSpecificdistDirectory = dirname(
              isWindows ? this.convertToWindowsPath(codeFilePath) : codeFilePath
            );
            mkdirSync(osSpecificdistDirectory, { recursive: true });

            const osSpecificFilePath = isWindows
              ? this.convertToWindowsPath(codeFilePath)
              : codeFilePath;
            writeFileSync(osSpecificFilePath, code);

            if (options.sourceMaps) {
              this.writeSourceMap(isWindows, distFilePath, map);
            }

            resolve(1);
          })
          .catch((err: any) => console.error(err));

      fileTransformationPromises.push(new Promise(fileTransformerPromise));
    }

    await Promise.allSettled(fileTransformationPromises);

    console.log(
      SWC_DEBUG_LOG_PREFIX,
      `Successfully transpiled ${fileNames.length} files in ${Date.now() - now}ms`
    );
  }

  writeSourceMap(
    isWindows: boolean,
    distFilePath: string,
    map: string | undefined
  ): void {
    if (!map) return;
    const mapFilePath = distFilePath
      .replace(/\.ts$/, ".js.map")
      .replace(/\.tsx$/, ".js.map");
    const osSpecificMapFilePath = isWindows
      ? this.convertToWindowsPath(mapFilePath)
      : mapFilePath;
    writeFileSync(osSpecificMapFilePath, map);
  }

  getDistPath(
    isWindows: boolean,
    filePath: string,
    outDir: string,
    baseUrl: string
  ): string {
    return join(outDir, join(filePath).replace(join(baseUrl), ""))
      .replace(join(baseUrl), "")
      .replace(isWindows ? /^\\/ : /^\//, "");
  }

  convertToWindowsPath(filePath: string): string {
    return filePath.replace(/\//g, "\\");
  }
}
