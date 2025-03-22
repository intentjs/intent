import { ConfigurationLoader } from "../lib/configuration/configuration-loader.js";
import { INTENT_CONFIG_FILE_NAME } from "../lib/constants.js";
import { AssetsManager } from "../lib/dev-server/assets/assets-manager.js";
import { defaultSwcOptionsFactory } from "../lib/dev-server/swc/default-options.js";
import { SwcFileTransformer } from "../lib/dev-server/swc/swc-file-transformer.js";
import { TypeChecker } from "../lib/dev-server/type-checker/type-checker.js";
import { TsConfigLoader } from "../lib/dev-server/typescript/tsconfig-loader.js";
import { isTruthy } from "../lib/utils/helpers.js";
import FSExtra from "fs-extra";

const { existsSync, mkdirSync } = FSExtra;

export class BuildCommand {
  protected readonly configurationLoader = new ConfigurationLoader();
  protected readonly tsConfigLoader = new TsConfigLoader();
  protected readonly swcFileTransformer = new SwcFileTransformer();

  async handle(options: Record<string, any>): Promise<void> {
    const { debug = false, disableTypeCheck, tsconfig: tsConfigPath } = options;

    const TS_CONFIG = this.tsConfigLoader.load(tsConfigPath);

    // check if outdir exists
    const outDir = TS_CONFIG.options.outDir;
    if (!existsSync(outDir as string)) {
      mkdirSync(outDir as string);
    }

    const INTENT_CONFIG = await this.configurationLoader.load(
      INTENT_CONFIG_FILE_NAME,
      TS_CONFIG,
      { watch: false, debug, typeCheck: !isTruthy(disableTypeCheck) }
    );

    const typeChecker = new TypeChecker();
    await typeChecker.handle(tsConfigPath, INTENT_CONFIG);

    const assetsManager = new AssetsManager();
    await assetsManager.handle(TS_CONFIG, INTENT_CONFIG);

    const SWC_OPTIONS = defaultSwcOptionsFactory(TS_CONFIG, INTENT_CONFIG);
    await this.swcFileTransformer.handle(TS_CONFIG, INTENT_CONFIG, SWC_OPTIONS);
  }
}
