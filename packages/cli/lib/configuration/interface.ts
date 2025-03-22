import { Options } from "@swc/core";

type BuildOptions = {
  /** Whether to delete the output directory. */
  deleteOutDir: boolean;
};

type MetaFileOptions = string | { path: string; watch?: boolean };

export type IntentConfiguration = {
  /** The root directory of the source code. */
  sourceRoot: string;

  /** The file that will be used to boot the server. */
  serverBootFile: string /**  */;

  /** Whether to enable debug mode. */
  debug?: boolean;

  /** Options for the build process. */
  buildOptions?: BuildOptions;

  /** Whether to watch for changes in the meta files. */
  watchMetaFiles?: boolean;

  /** The files to watch for changes. */
  metaFiles?: MetaFileOptions[];

  /** Options for the SWC compiler. */
  swc?: string | Options;

  /** Whether to type check the source code. Default is true. */
  typeCheck?: boolean;

  /** Whether to watch for changes in the source code. Default is true. */
  watch?: boolean;
};
