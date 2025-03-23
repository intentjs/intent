import { Request } from '@intentjs/hyper-express';
import { Injectable } from '../foundation/decorators.js';
import { ExecutionContext } from '../rest/http-server/contexts/execution-context.js';
import { HttpGuard } from '../rest/foundation/guards/base-guard.js';

@Injectable()
export class ValidationGuard extends HttpGuard {
  constructor() {
    super();
  }

  async guard(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const reflector = context.getReflector();
    /**
     * Check if a DTO already exists
     */
    const dto = request.dto();
    const schema = reflector.getFromMethod('dtoSchema');
    await request.validate(schema);
    return true;
  }
}
