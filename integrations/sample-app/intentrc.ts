import { defineConfig } from '@intentjs/cli/config';

export default defineConfig({
  /**
   * @description The root directory of the source code.
   */
  sourceRoot: 'app',

  /**
   * @description The file to be executed when the server starts.
   */
  serverBootFile: 'server',

  /**
   * @description Whether to enable debug mode.
   */
  debug: true,

  /**
   * @description Whether to watch meta files.
   */
  watchMetaFiles: true,

  /**
   * @description The meta files to be watched.
   */
  metaFiles: [{ path: 'resources/lang/*.json', watch: false }],

  /**
   * @description Whether to enable type checking.
   */
  typeCheck: false,
});
