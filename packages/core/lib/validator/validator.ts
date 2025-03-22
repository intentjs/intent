import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { ConfigService } from '../config/service.js';
import { ValidationFailed } from '../exceptions/validation-failed.js';
import { Type } from '../interfaces/utils.js';

export class Validator<T> {
  private meta: Record<string, any>;
  constructor(private dto: Type<T>) {
    this.meta = {};
  }

  static compareWith<T>(dto: Type<T>): Validator<T> {
    return new Validator(dto);
  }

  /**
   * Use this method to add some extra information into your DTO.
   * Meta included is available at `$` property inside your DTO.
   * You can later use the meta properties inside your decorators.
   */
  addMeta(meta: Record<string, any>): this {
    this.meta = meta || {};
    return this;
  }

  async validateRaw(inputs: Record<string, any>): Promise<T> {
    const schema: T = plainToInstance(this.dto, inputs);

    const errors = await validate(schema as Record<string, any>, {
      stopAtFirstError: true,
    });

    if (errors.length > 0) {
      await this.processErrorsFromValidation(errors);
    }

    return schema;
  }

  async validateDto(dto: T): Promise<T> {
    const errors = await validate(dto as Record<string, any>, {
      stopAtFirstError: true,
    });

    if (errors.length > 0) {
      await this.processErrorsFromValidation(errors);
    }

    return dto;
  }

  /**
   * Process errors, if any.
   * Throws new ValidationFailed Exception with validation errors
   */
  async processErrorsFromValidation(errors: ValidationError[]): Promise<void> {
    const serializerClass = ConfigService.get(
      'app.error.validationErrorSerializer',
    );
    if (!serializerClass) throw new ValidationFailed(errors);
    const serializer = new serializerClass();
    const errorData = await serializer.handle(errors);
    throw new ValidationFailed(errorData);
  }

  injectMeta<T>(schema: T): T {
    schema['$'] = this.meta || {};
    const inject = (obj: any, injectionKey: string, injectionValue: any) => {
      for (const key in obj) {
        if (key === injectionKey) continue;
        if (typeof obj[key] === 'object')
          obj[key] = inject(obj[key], injectionKey, injectionValue);
      }
      obj[injectionKey] = injectionValue;
      return obj;
    };

    return inject(schema, '$', this.meta);
  }
}
