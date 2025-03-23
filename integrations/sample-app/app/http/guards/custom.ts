import { Injectable } from '@intentjs/core';
import { ExecutionContext, HttpGuard } from '@intentjs/core/http';

@Injectable()
export class CustomGuard extends HttpGuard {
  async guard(ctx: ExecutionContext): Promise<boolean> {
    return true;
  }
}
