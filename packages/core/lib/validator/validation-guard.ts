import { Request } from '@intentjs/hyper-express';
import { Injectable } from '../foundation/decorators.js';
import { IntentGuard } from '../rest/foundation/guards/base-guard.js';
import { ExecutionContext } from '../rest/http-server/contexts/execution-context.js';

@Injectable()
export class IntentValidationGuard extends IntentGuard {
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
