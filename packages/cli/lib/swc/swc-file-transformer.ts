import { dirname, join } from "path";
import { defaultSwcOptionsFactory } from "./default-options";
import { mkdirSync, writeFileSync } from "fs-extra";
import chokidar from "chokidar";
import { fork } from "child_process";
import { ExtraOptions } from "../interfaces";
import { treeKillSync } from "../utils/tree-kill";
import { TsConfigLoader } from "../typescript/tsconfig-loader";
import { debounce } from "radash";
import { TypeCheckerHost } from "../type-checker/type-checker";
import { SWC_DEBUG_LOG_PREFIX } from "../utils/log-helpers";
import { Output, transformFile } from "@swc/core";
import { glob } from "node:fs/promises";
import { watch } from "node:fs";

export class SwcFileTransformer {
  tsConfigLoader = new TsConfigLoader();
  typeCheckerHost = new TypeCheckerHost();

  async run(
    tsConfigPath: string,
    options: ReturnType<typeof defaultSwcOptionsFactory>,
    extras: ExtraOptions,
    onSuccessHook?: () => void
  ): Promise<void> {
    if (extras.watch) {
      if (extras.typeCheck) {
        await this.runTypeCheck(extras);
      }

      await this.transformFiles(tsConfigPath, options, extras);

      if (onSuccessHook) {
        const debouncedSuccess = debounce({ delay: 500 }, onSuccessHook);
        debouncedSuccess();
      }

      const delayedOnChange = debounce({ delay: 150 }, () => {
        this.transformFiles(tsConfigPath, options, extras).then((val) => {
          onSuccessHook && onSuccessHook();
        });
      });

      this.watchIncludedFiles(tsConfigPath, delayedOnChange);
    } else {
      if (extras.typeCheck) {
        await this.runTypeCheck(extras);
      }

      await this.transformFiles(tsConfigPath, options, extras);
    }
  }

  async runTypeCheck(extras: ExtraOptions): Promise<void> {
    const tsConfigPath = this.tsConfigLoader.loadPath();

    if (extras.watch) {
      const args = [tsConfigPath, JSON.stringify(extras)];
      const childProcess = fork(
        join(__dirname, "../type-checker/forked-type-checker.js"),
        args,
        { cwd: process.cwd(), stdio: "inherit" }
      );

      process.on(
        "exit",
        () => childProcess && treeKillSync(childProcess.pid as number)
      );
    } else {
      const cb = (resolve: Function) =>
        this.typeCheckerHost.runOnce(tsConfigPath, {
          watch: false,
          onTypeCheck: (program: any) => {
            resolve(true);
          },
        });
      return new Promise((resolve) => cb(resolve));
    }
  }

  async transformFiles(
    tsConfigPath: string,
    options: ReturnType<typeof defaultSwcOptionsFactory>,
    extras: ExtraOptions
  ) {
    const now = Date.now();
    const tsConfig = this.tsConfigLoader.load(tsConfigPath);
    const { include = [] } = tsConfig;
    const fileTransformationPromises = [];
    const isWindows = process.platform === "win32";

    for (const filePath of include) {
      const fileTransformerPromise = (resolve: Function) =>
        transformFile(filePath, { ...options, filename: filePath })
          .then(({ code, map }: Output) => {
            const distFilePath = this.getDistPath(
              isWindows,
              filePath,
              tsConfig.compilerOptions.outDir,
              tsConfig.compilerOptions.baseUrl
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

            options.sourceMaps &&
              this.writeSourceMap(isWindows, distFilePath, map);

            resolve(1);
          })
          .catch((err: any) => console.error(err));

      fileTransformationPromises.push(new Promise(fileTransformerPromise));
    }

    await Promise.allSettled(fileTransformationPromises);

    console.log(
      SWC_DEBUG_LOG_PREFIX,
      `Successfully transpiled ${include.length} files in ${Date.now() - now}ms`
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

  writeToFile(resolve: Function) {}

  convertToWindowsPath(filePath: string): string {
    return filePath.replace(/\//g, "\\");
  }

  async watchIncludedFiles(
    tsConfigPath: string,
    onChange: () => void
  ): Promise<void> {
    const tsConfig = this.tsConfigLoader.load(tsConfigPath);
    const { includeDirs } = tsConfig;
    const cwd = process.cwd();

    const watchPatterns = [...includeDirs].map((dir: string) => join(cwd, dir));

    const watcher = chokidar.watch(".", {
      persistent: true,
      ignoreInitial: true,
      cwd,
      awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
      ignored: (filepath) => {
        if (filepath === process.cwd()) {
          return false;
        }

        for (const watchPattern of watchPatterns) {
          if (filepath.includes(watchPattern)) return false;
        }

        return true;
      },
    });

    watcher
      .on("add", () => onChange())
      .on("change", (filepath: string) => onChange())
      .on("error", (error) => onChange());

    if (process.env.NODE_ENV == "coredev") {
      const libDir = join(process.cwd(), "../../node_modules/@intentjs");
      const libWatcher = chokidar.watch(".", {
        persistent: true,
        ignoreInitial: true,
        cwd: libDir,
        awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
        ignored: (filepath) => {
          if (filepath.includes(libDir)) return false;

          if (filepath === libDir) {
            return false;
          }

          for (const watchPattern of watchPatterns) {
            if (filepath.includes(watchPattern)) return false;
          }

          return true;
        },
      });

      libWatcher
        .on("add", () => onChange())
        .on("change", (filepath: string) => onChange())
        .on("error", (error) => onChange());
    }
  }
}
