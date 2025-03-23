import { Injectable } from '@intentjs/core';
import { ExecutionContext, HttpGuard } from '@intentjs/core/http';

@Injectable()
export class GlobalGuard extends HttpGuard {
  async guard(ctx: ExecutionContext): Promise<boolean> {
    return true;
  }
}
