import { ExecutionContext } from '@intentjs/core/http';
import { createParamDecorator } from '@intentjs/core/http';

export const CustomParam = createParamDecorator(
  (data: any, ctx: ExecutionContext, argIndex: number) => {
    return 'data from custom decorator param';
  },
);
