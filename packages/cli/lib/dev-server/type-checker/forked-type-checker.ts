import ts from "typescript";
import { TypeCheckerHost } from "./type-checker-host.js";
import { ExtraOptions } from "../../interfaces.js";

const [tsConfigPath, stringifiedExtra] = process.argv.slice(2);

export class ForkedTypeCheckerHost {
  private typeChecker = new TypeCheckerHost();

  run(tsConfigPath: string, extras: ExtraOptions) {
    const onTypeCheckFunction = (program: ts.Program) => {
      const diagnostics = ts.getPreEmitDiagnostics(program);
      const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      };

      console.log(
        ts.formatDiagnosticsWithColorAndContext(
          diagnostics,
          formatDiagnosticsHost
        )
      );
    };

    this.typeChecker.runInWatchMode(tsConfigPath, {
      watch: extras.watch,
      onProgramInit: onTypeCheckFunction,
      onTypeCheck: onTypeCheckFunction,
    });
  }
}

const forkedTypeChecker = new ForkedTypeCheckerHost();
forkedTypeChecker.run(tsConfigPath, JSON.parse(stringifiedExtra));
