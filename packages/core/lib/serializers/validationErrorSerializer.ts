import { ValidationError } from 'class-validator';
import { isEmpty } from '../utils/helpers.js';
import { Str } from '../utils/string.js';

export class ValidationErrorSerializer {
  async handle(errors: ValidationError[]): Promise<Record<string, any>> {
    let bag = {};
    for (const error of errors) {
      const errorsFromParser = this.parseError(error);
      const childErrorBag = {};
      for (const key in errorsFromParser) {
        if (!isEmpty(errorsFromParser[key])) {
          childErrorBag[key] = errorsFromParser[key];
        }
      }
      bag = { ...bag, ...childErrorBag };
    }

    return bag;
  }

  parseError(error: ValidationError) {
    const children = [];
    for (const child of error.children || []) {
      children.push(this.parseError(child));
    }

    const messages = Object.values(error.constraints || {}).map(m =>
      Str.replace(m, error.property, Str.title(error.property)),
    );

    const errors = {};
    if (!isEmpty(messages)) {
      errors[error.property] = messages;
    }

    for (const child of children) {
      for (const key in child) {
        errors[`${error.property}.${key}`] = child[key];
      }
    }

    return errors;
  }
}
