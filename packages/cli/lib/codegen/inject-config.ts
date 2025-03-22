import { join, normalize } from "path";
import { DownloadFromRegistry } from "./download-registry.js";
import { InjectConfig } from "./ast/inject-config.js";
import { downloadPackageUsingNpm } from "../new-project/actions/download-depedencies.js";
import { EnvManager } from "./env-manager.js";

export class InjectConfigCodegen {
  constructor(private projectDirectory: string) {}

  async handle(registryUrl: string): Promise<void> {
    try {
      const downloadFromRegistryTask = new DownloadFromRegistry();
      const config = (await downloadFromRegistryTask.handle(
        registryUrl
      )) as InjectConfigRegistryType;

      const { filename, dependencies, env } = config;
      if (!filename) {
        console.warn(
          "cannot proceed to inject the config without `filename` attribute."
        );
      }
      const filePath = normalize(join(this.projectDirectory, filename));

      /**
       * Inject key, value in the specified `filename`
       */
      const injectConfigTask = new InjectConfig(
        this.projectDirectory,
        filePath
      );
      injectConfigTask.handle(config);

      if (dependencies) {
        await this.installDependencies(dependencies);
      }

      if (env && env.length) {
        await this.setEnvironmentVariables(env);
      }
    } catch (e) {
      console.log("error ==> ", e);
    }
  }

  async setEnvironmentVariables(env: [string, string][]): Promise<void> {
    const envManager = new EnvManager(
      normalize(join(this.projectDirectory, ".env"))
    );

    for (const envRow of env) {
      const [variable, value] = envRow;
      if (!variable) continue;
      await envManager.updateVariable(variable, value);
    }
  }

  async installDependencies(dependencies: Record<string, any>): Promise<void> {
    await downloadPackageUsingNpm(
      this.projectDirectory,
      Object.keys(dependencies)
    );
  }
}

export type InjectConfigRegistryType = {
  type: "inject-config";
  dependencies: Record<string, any> | undefined;
  namespace: string;
  key: string[];
  filename: string;
  env: [string, string][];
  value: Record<string, any>;
};
