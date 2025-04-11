import { RspackDevServer } from '@rspack/dev-server';
import { rspack } from '@rspack/core';
import { resolve } from 'path';

export const createRspackCompiler = async () => {
  const readConfig = await import(resolve(__dirname, 'rspack.config.js'));
  console.log(readConfig);
  return rspack(readConfig.default);
};
