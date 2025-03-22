import { fork } from "child_process";
import { ExtraOptions } from "../../interfaces.js";
import { TypeCheckerHost } from "./type-checker-host.js";
import { treeKillSync } from "../../utils/tree-kill.js";
import { join } from "path";
import { IntentConfiguration } from "../../configuration/interface.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TypeChecker {
  private typeCheckerHost = new TypeCheckerHost();

  constructor() {}

  async handle(tsConfigPath: string, INTENT_CONFIG: IntentConfiguration) {
    const { typeCheck, watch } = INTENT_CONFIG;
    if (typeCheck && !watch) {
      await this.runTypeCheckOnce(tsConfigPath);
    } else if (typeCheck && watch) {
      await this.runTypeCheckInWatchMode(tsConfigPath, INTENT_CONFIG);
    }
  }

  async runTypeCheckOnce(tsConfigPath: string): Promise<void> {
    const onTypeCheck = (resolve: Function) => (program: any) => resolve(true);

    const options = (resolve: Function) => ({
      watch: false,
      onTypeCheck: onTypeCheck(resolve),
    });

    return new Promise((resolve) =>
      this.typeCheckerHost.runOnce(tsConfigPath, options(resolve))
    );
  }

  async runTypeCheckInWatchMode(
    tsConfigPath: string,
    extras: ExtraOptions
  ): Promise<void> {
    const args = [tsConfigPath, JSON.stringify(extras)];
    const childProcess = fork(
      join(__dirname, "./forked-type-checker.js"),
      args,
      { cwd: process.cwd(), stdio: "inherit" }
    );

    process.on(
      "exit",
      () => childProcess && treeKillSync(childProcess.pid as number)
    );
  }
}
