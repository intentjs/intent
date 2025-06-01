import { existsSync } from "fs";
import { spawn } from "child_process";
import killProcess from "tree-kill";
import { ConfigurationLoader } from "../lib/configuration/configuration-loader.js";
import { IntentConfiguration } from "../lib/configuration/interface.js";
import { defaultSwcOptionsFactory } from "../lib/dev-server/swc/default-options.js";
import { TsConfigLoader } from "../lib/dev-server/typescript/tsconfig-loader.js";
import { isTruthy } from "../lib/utils/helpers.js";
import { treeKillSync } from "../lib/utils/tree-kill.js";
import { SwcFileTransformer } from "../lib/dev-server/swc/swc-file-transformer.js";
import { INTENT_CONFIG_FILE_NAME } from "../lib/configuration/constant.js";
import fsExtra from "fs-extra";
import { DevServer } from "../lib/dev-server/dev-server.js";
import { AssetsManager } from "../lib/dev-server/assets/assets-manager.js";
import { IntentCliFileTransformer } from "../lib/configuration/intent-cli.js";

const { mkdirSync } = fsExtra;
export class StartServerCommand {
  protected readonly configurationLoader = new ConfigurationLoader();
  protected readonly tsConfigLoader = new TsConfigLoader();
  protected readonly swcFileTransformer = new SwcFileTransformer();

  async handle(options: Record<string, any>): Promise<void> {
    const {
      watch = false,
      debug = false,
      disableTypeCheck,
      config,
      tsconfig: tsConfigFile,
      port,
    } = options;

    const tsConfigPath = this.tsConfigLoader.loadPath(tsConfigFile);

    const TS_CONFIG = this.tsConfigLoader.load(tsConfigPath);

    // check if outdir exists
    const outDir = TS_CONFIG.options.outDir;
    if (!existsSync(outDir as string)) {
      mkdirSync(outDir as string);
    }

    const INTENT_CONFIG = await this.configurationLoader.load(
      INTENT_CONFIG_FILE_NAME,
      TS_CONFIG,
      { watch, debug, typeCheck: !isTruthy(disableTypeCheck) }
    );

    const intentCliFileTransformer = new IntentCliFileTransformer();
    await intentCliFileTransformer.load(TS_CONFIG);

    const assetsManager = new AssetsManager();
    const assetsOnUpdateHook = await assetsManager.handle(
      TS_CONFIG,
      INTENT_CONFIG
    );

    const SWC_OPTIONS = defaultSwcOptionsFactory(TS_CONFIG, INTENT_CONFIG);

    const onSuccessHook = this.createOnSuccessHook(INTENT_CONFIG);

    const swcOnUpdateHook = await this.swcFileTransformer.handle(
      tsConfigPath,
      INTENT_CONFIG,
      SWC_OPTIONS
    );

    const devServer = new DevServer();
    await devServer.run(
      tsConfigPath,
      TS_CONFIG,
      INTENT_CONFIG,
      swcOnUpdateHook,
      assetsOnUpdateHook,
      onSuccessHook
    );
  }

  private createOnSuccessHook(INTENT_CONFIG: IntentConfiguration) {
    let childProcessRef: any;
    process.on("exit", () => {
      childProcessRef && treeKillSync(childProcessRef.pid);
    });

    return () => {
      if (childProcessRef) {
        childProcessRef.removeAllListeners("exit");
        childProcessRef.on("exit", () => {
          childProcessRef = this.spawnChildProcess(
            INTENT_CONFIG.serverBootFile,
            INTENT_CONFIG.debug,
            "node"
          );
          childProcessRef.on("exit", () => (childProcessRef = undefined));
        });
        childProcessRef.stdin && childProcessRef.stdin.pause();
        killProcess(childProcessRef.pid);
      } else {
        childProcessRef = this.spawnChildProcess(
          INTENT_CONFIG.serverBootFile,
          INTENT_CONFIG.debug,
          "node"
        );
        childProcessRef.on("exit", (code: number) => {
          process.exitCode = code;
          childProcessRef = undefined;
        });
      }
    };
  }

  private spawnChildProcess(
    serverFile: string,
    debug: boolean | string | undefined,
    binaryToRun: string
  ) {
    let childProcessArgs: string[] = [];
    const argsStartIndex = process.argv.indexOf("--");
    if (argsStartIndex >= 0) {
      childProcessArgs = process.argv
        .slice(argsStartIndex + 1)
        .map((arg) => JSON.stringify(arg));
    }

    debug && childProcessArgs.push(`--debug=${debug}`);

    const outputFilePath =
      serverFile.indexOf(" ") >= 0 ? `"${serverFile}"` : serverFile;

    const processArgs = [outputFilePath, ...childProcessArgs];

    if (debug) {
      const inspectFlag =
        typeof debug === "string" ? `--inspect=${debug}` : "--inspect";
      processArgs.unshift(inspectFlag);
    }

    processArgs.unshift("--enable-source-maps");

    return spawn(binaryToRun, processArgs, {
      stdio: "inherit",
      shell: true,
    });
  }
}
