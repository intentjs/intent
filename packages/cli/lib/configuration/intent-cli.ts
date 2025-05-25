import { INTENT_LOG_PREFIX } from "../utils/log-helpers.js";
import pc from "picocolors";
import { SwcTransformer } from "../dev-server/swc/swc-transformer.js";
import { ParsedCommandLine } from "typescript";
import { INTENT_CLI_FILE } from "../constants.js";
import { readFileSync, writeFileSync } from "fs";

export class IntentCliFileTransformer {
  private swcTransformer = new SwcTransformer();

  async load(TS_CONFIG: ParsedCommandLine): Promise<void> {
    try {
      const tempIntentRcPath = await this.swcTransformer.transpileTemp(
        INTENT_CLI_FILE,
        "intent",
        TS_CONFIG
      );

      const code = readFileSync(tempIntentRcPath, "utf-8");

      const newCode = code.replace(
        /import\s+['"]@intentjs\/ts-node\/esm['"];?/g,
        ""
      );

      writeFileSync(tempIntentRcPath, newCode);
    } catch (e) {
      console.log(e);
      console.log(INTENT_LOG_PREFIX, pc.red(e.message));
      process.exit();
    }
  }
}
