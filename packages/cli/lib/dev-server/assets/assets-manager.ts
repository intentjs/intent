import { ParsedCommandLine } from "typescript";
import { IntentConfiguration } from "../../configuration/interface.js";
import fg from "fast-glob";
import { dirname, resolve } from "path";
import fs from "fs-extra";

const { ensureDir, copyFile } = fs;

export class AssetsManager {
  constructor() {}

  async handle(
    TS_CONFIG: ParsedCommandLine,
    INTENT_CONFIG: IntentConfiguration
  ) {
    const { metaFiles = [] } = INTENT_CONFIG;

    const copyMetaFiles = async () => {
      const filePatterns = metaFiles.map((file: any) => file.path);
      const qualifiedFiles = await fg(filePatterns, { dot: true });

      const promises = [];
      for (const file of qualifiedFiles) {
        const destinationPath = resolve(
          TS_CONFIG.options.outDir as string,
          ...file.split("/")
        );

        promises.push(this.syncMetaFile(file, destinationPath));
      }

      await Promise.allSettled(promises);
    };

    await copyMetaFiles();

    return copyMetaFiles.bind(this);
  }

  async syncMetaFile(source: string, destination: string) {
    await ensureDir(dirname(destination));

    await copyFile(source, destination);
  }
}
