import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isEmpty } from '../../utils/helpers.js';
import { ObjectionService } from '../../database/service.js';

@Injectable()
@ValidatorConstraint({ async: true })
export class ExistsConstraint implements ValidatorConstraintInterface {
  constructor() {}

  public async validate(
    value: string | string[],
    args: ValidationArguments,
  ): Promise<boolean> {
    if (!value && isEmpty(value)) return false;
    const [{ table, column, dbCon }] = args.constraints;

    const connection = ObjectionService.connection(dbCon);

    const query = connection(table);
    Array.isArray(value)
      ? query.whereIn(column, value)
      : query.where(column, value);

    const result = await query;

    if (!result.length) return false;

    if (Array.isArray(value) && result.length !== value.length) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const [options] = args.constraints;
    return `${options.column} does not exist.`;
  }
}

export function Exists(
  options: {
    table: string;
    column: string;
    dbCon?: string;
  },
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: ExistsConstraint,
    });
  };
}
