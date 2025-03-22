import { LiteralString } from '../type-helpers/index.js';
import {
  RegisterNamespaceOptions,
  RegisterNamespaceReturnType,
} from './options.js';

import dotenv from 'dotenv';
dotenv.config();

export const configNamespace = <N extends string, T>(
  namespace: LiteralString<N>,
  factory: () => T | Promise<T>,
  options?: RegisterNamespaceOptions,
): RegisterNamespaceReturnType<LiteralString<N>, T> => {
  return {
    _: {
      namespace,
      options: {
        encrypt: options?.encrypt ?? false,
      },
      factory,
    },
    $inferConfig: {} as T,
  };
};
