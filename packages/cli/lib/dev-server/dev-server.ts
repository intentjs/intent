import { ParsedCommandLine } from "typescript";
import chokidar from "chokidar";
import { join, resolve } from "path";
import { IntentConfiguration } from "../configuration/interface.js";
import { debounce } from "radash";
import pm from "picomatch";
import { isWindows } from "../utils/helpers.js";
import { TypeChecker } from "./type-checker/type-checker.js";

type WatchPattern = {
  pattern: string;
  watch: boolean;
};

export class DevServer {
  private readonly typeChecker = new TypeChecker();

  constructor() {}

  async run(
    tsConfigPath: string,
    TS_CONFIG: ParsedCommandLine,
    INTENT_CONFIG: IntentConfiguration,
    swcOnUpdateHook: () => Promise<void>,
    assetsOnUpdateHook: () => Promise<void>,
    onSuccessHook: () => void
  ) {
    await this.typeChecker.handle(tsConfigPath, INTENT_CONFIG);

    const { watch } = INTENT_CONFIG;

    if (!watch) {
      onSuccessHook();
      return;
    }

    const delayedOnSuccessHook = debounce({ delay: 500 }, onSuccessHook);
    delayedOnSuccessHook();

    const delayedOnChange = debounce({ delay: 150 }, () => {
      Promise.allSettled([swcOnUpdateHook(), assetsOnUpdateHook()]).then(() => {
        onSuccessHook();
      });
    });

    const watchPatterns = await this.generateWatchPatterns(
      INTENT_CONFIG,
      TS_CONFIG
    );
    await this.watchIncludedFiles(watchPatterns, delayedOnChange);
  }

  async generateWatchPatterns(
    INTENT_CONFIG: IntentConfiguration,
    TS_CONFIG: ParsedCommandLine
  ): Promise<WatchPattern[]> {
    const {
      raw: { include = [] },
    } = TS_CONFIG;

    const metaFiles = INTENT_CONFIG.metaFiles || [];
    const watchMetaFiles = INTENT_CONFIG.watchMetaFiles || true;

    const watchPatterns: WatchPattern[] = [];
    const cwd = process.cwd();

    for (const pattern of include) {
      const path = resolve(cwd, pattern);
      watchPatterns.push({
        pattern: path,
        watch: true,
      });

      watchPatterns.push({
        pattern: path.includes("**") ? path : `${path}/**`,
        watch: true,
      });
    }

    for (const pattern of metaFiles) {
      const path = resolve(
        cwd,
        typeof pattern === "string" ? pattern : pattern.path
      );

      watchPatterns.push({
        pattern: path,
        watch:
          typeof pattern === "string"
            ? watchMetaFiles
            : (pattern.watch ?? watchMetaFiles),
      });
    }

    if (process.env.NODE_ENV == "coredev") {
      const path = resolve(cwd, "node_modules/@intentjs");
      watchPatterns.push({ pattern: path, watch: true });
      watchPatterns.push({ pattern: `${path}/**`, watch: true });
    }

    return watchPatterns;
  }

  async watchIncludedFiles(
    watchPatterns: WatchPattern[],
    onChange: () => void
  ): Promise<void> {
    const cwd = process.cwd();
    const ignoredPatternCb = (filepath: string) => {
      if (filepath === cwd) return false;

      for (const watchPattern of watchPatterns) {
        const match = pm(watchPattern.pattern, { windows: isWindows(), cwd });
        if (match(filepath) && watchPattern.watch) return false;
      }

      return true;
    };

    const watcher = chokidar.watch(".", {
      persistent: true,
      ignoreInitial: true,
      cwd: process.cwd(),
      awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
      ignored: ignoredPatternCb,
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
            // if (watchPattern(filepath)) return false;
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
