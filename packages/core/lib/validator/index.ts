import { applyDecorators } from '../reflections/apply-decorators.js';
import { SetMetadata } from '../reflections/set-metadata.js';
import { UseGuards } from '../rest/index.js';
import { IntentValidationGuard } from './validation-guard.js';

export * from './validator.js';
export * from './decorators/index.js';

export function Validate(DTO: any) {
  return applyDecorators(
    SetMetadata('dtoSchema', DTO),
    UseGuards(IntentValidationGuard),
  );
}
