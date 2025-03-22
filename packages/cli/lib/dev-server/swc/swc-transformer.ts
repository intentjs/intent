import { transform } from "@swc/core";
import FSExtra from "fs-extra";
import { BASE_SWC_OPTIONS } from "./default-options.js";
import { ParsedCommandLine } from "typescript";
import { resolve } from "path";

const { readFileSync, writeFileSync } = FSExtra;

type TemporaryFilePath = string;

export class SwcTransformer {
  constructor() {}

  async transpileTemp(
    tsFilePath: string,
    jsFileName: string,
    tsConfig: ParsedCommandLine
  ): Promise<TemporaryFilePath> {
    const content = readFileSync(tsFilePath, "utf-8");
    const result = await transform(content, BASE_SWC_OPTIONS());

    const {
      options: { outDir },
    } = tsConfig;

    const tempFilePath = resolve(outDir as string, jsFileName);

    writeFileSync(tempFilePath, result.code);

    return tempFilePath;
  }
}
