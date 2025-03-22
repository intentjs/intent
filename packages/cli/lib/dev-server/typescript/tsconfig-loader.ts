import { dirname } from "path";
import ts, { ParsedCommandLine } from "typescript";
import { INTENT_LOG_PREFIX } from "../../utils/log-helpers.js";
import pc from "picocolors";
import { NO_TSCONFIG_FOUND } from "../../utils/messages.js";
import { TSCONFIG_BUILD_JSON, TSCONFIG_JSON } from "../../constants.js";

export class TsConfigLoader {
  loadCliOptions(customPath?: string) {
    const configPath = this.loadPath(customPath);
    const parsedCmd = ts.getParsedCommandLineOfConfigFile(
      configPath,
      undefined!,
      ts.sys as unknown as ts.ParseConfigFileHost
    );
    const { options, fileNames, projectReferences } = parsedCmd!;
    return { options, fileNames, projectReferences };
  }

  load(customPath?: string): ParsedCommandLine {
    const configPath = this.loadPath(customPath);

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      dirname(configPath)
    );

    return parsedConfig;

    // return {
    //   compilerOptions: parsedConfig.options,
    //   include: parsedConfig.fileNames,
    //   exclude: parsedConfig.wildcardDirectories
    //     ? Object.keys(parsedConfig.wildcardDirectories)
    //     : undefined,
    //   includeDirs: parsedConfig.raw.include,
    // };
  }

  loadPath(customPath?: string): string {
    try {
      const tsConfigFile = customPath || TSCONFIG_BUILD_JSON || TSCONFIG_JSON;

      const configPath = ts.findConfigFile(
        process.cwd(),
        ts.sys.fileExists,
        tsConfigFile
      ) as string;

      if (!configPath) {
        console.log(
          INTENT_LOG_PREFIX,
          pc.red(NO_TSCONFIG_FOUND(`\`${tsConfigFile}\``))
        );
        process.exit();
      }

      return configPath;
    } catch (e) {
      console.log(INTENT_LOG_PREFIX, pc.red(e.message));
      process.exit(1);
    }
  }
}
