import ts from "typescript";
import pc from "picocolors";
import {
  TSC_DEBUG_LOG_PREFIX,
  TSC_LOG_PREFIX,
} from "../../utils/log-helpers.js";
import { TsConfigLoader } from "../typescript/tsconfig-loader.js";

/* eslint-disable @typescript-eslint/no-var-requires */

export type TypeCheckerOptions = {
  watch?: boolean;
  onTypeCheck?: (program: ts.Program) => void;
  onProgramInit?: (program: ts.Program) => void;
};

export class TypeCheckerHost {
  private tsConfigLoader = new TsConfigLoader();
  runOnce(tsConfigPath: string, options?: TypeCheckerOptions) {
    const {
      options: tsOptions,
      fileNames,
      projectReferences,
    } = this.tsConfigLoader.loadCliOptions(tsConfigPath);

    const createProgram = ts.createIncrementalProgram ?? ts.createProgram;

    const program = createProgram.call(ts, {
      rootNames: fileNames,
      projectReferences,
      options: { ...tsOptions, emitDeclarationOnly: true, noEmit: false },
    });

    const programRef = program.getProgram
      ? program.getProgram()
      : (program as any as ts.Program);

    const diagnostics = ts.getPreEmitDiagnostics(programRef);
    if (diagnostics.length > 0) {
      const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      };

      console.log();
      console.log(
        ts.formatDiagnosticsWithColorAndContext(
          diagnostics,
          formatDiagnosticsHost
        )
      );
      process.exit(1);
    }
    options?.onTypeCheck?.(programRef);
  }

  runInWatchMode(
    tsConfigPath: string,
    tsConfig: Record<string, any>,
    options?: TypeCheckerOptions
  ) {
    let watchProgram: ts.WatchOfConfigFile<ts.BuilderProgram> | undefined =
      undefined;

    const origDiagnosticReporter = (ts as any).createDiagnosticReporter(
      ts.sys,
      true
    );

    const callBack = (
      diagnostic: ts.Diagnostic,
      newLine: string,
      compilerOptions: ts.CompilerOptions,
      errorCount?: number
    ) => {
      errorCount = errorCount || 0;

      if (errorCount > 0) {
        console.log(TSC_LOG_PREFIX, pc.red(diagnostic.messageText as string));
        return;
      } else {
        console.log(TSC_DEBUG_LOG_PREFIX, diagnostic.messageText);
      }

      if (!watchProgram) return;
      options?.onTypeCheck?.(watchProgram.getProgram().getProgram());
    };

    const host = ts.createWatchCompilerHost(
      tsConfigPath,
      {
        ...tsConfig.compilerOptions,
        preserveWatchOutput: true,
        noEmit: false,
        emitDeclarationOnly: true,
        experimentalDecorators: true,
      },
      ts.sys,
      undefined,
      origDiagnosticReporter,
      callBack
    );

    watchProgram = ts.createWatchProgram(host);
    process.nextTick(() => {
      options?.onProgramInit?.(watchProgram.getProgram().getProgram());
    });
  }
}
