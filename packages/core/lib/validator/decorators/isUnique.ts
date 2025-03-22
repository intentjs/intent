import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ObjectionService } from '../../database/service.js';
import { isEmpty } from '../../utils/helpers.js';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor() {}

  public async validate(
    value: string | string[],
    args: ValidationArguments,
  ): Promise<boolean> {
    if (isEmpty(value)) return false;
    const [{ table, column, dbCon }] = args.constraints;
    const connection = ObjectionService.connection(dbCon);

    const query = connection(table);
    Array.isArray(value)
      ? query.whereIn(column, value)
      : query.where(column, value);

    /**
     * Apply self unique check, useful in case of update queries
     */
    const { object } = args;
    const id = object['id'];

    if (id) query.whereNot('id', id);

    const result = await query.count({ count: '*' });
    const record = result[0] || {};
    const count = +record['count'];

    return Array.isArray(value) ? !(value.length === count) : !count;
  }

  defaultMessage(args: ValidationArguments) {
    const [options] = args.constraints;
    return `${options.column} already exists.`;
  }
}

export function IsUnique(
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
      validator: IsUniqueConstraint,
    });
  };
}
