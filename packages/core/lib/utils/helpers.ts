import { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import pc from 'picocolors';
import { GenericClass } from '../interfaces/index.js';
import { Arr } from './array.js';
import { InternalLogger } from './logger.js';
import { Obj } from './object.js';
import { Str } from './string.js';
import { join } from 'path';
import { findProjectRoot } from './path.js';
import fsExtra from 'fs-extra';

const { readFileSync } = fsExtra;
export const isEmpty = (value: any) => {
  if (Str.isString(value)) {
    return value === '';
  }

  if (Arr.isArray(value)) {
    return !value.length;
  }

  if (Obj.isObj(value)) {
    return Obj.isEmpty(value);
  }

  if (Number.isNaN(value) || value === undefined) {
    return true;
  }

  return false;
};

export const isBoolean = (value: any): boolean => {
  return typeof value === 'boolean';
};

export const toBoolean = (value: any) => {
  const val = String(value);
  return [true, 'yes', 'on', '1', 1, 'true'].includes(val?.toLowerCase());
};

export const joinUrl = (url: string, appendString: string): string => {
  return url.endsWith('/') ? `${url}${appendString}` : `${url}/${appendString}`;
};

export const logTime = (time: number): string => {
  return pc.yellow(`+${time}ms`);
};

export const getTimestampForLog = (): string => {
  const timestamp = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).format(new Date());

  return pc.bgGreen(pc.black(' ' + timestamp + ' '));
};

export const validateOptions = (
  payload: Record<string, any>,
  schema: Type<GenericClass>,
  meta: Record<string, any> = {},
): void => {
  const dto = plainToInstance(schema, payload);
  const errors = validateSync(dto);

  let bag = {};
  for (const error of errors) {
    const errorsFromParser = parseError(error);
    const childErrorBag = {};
    for (const key in errorsFromParser) {
      if (!isEmpty(errorsFromParser[key])) {
        childErrorBag[key] = errorsFromParser[key];
      }
    }
    bag = { ...bag, ...childErrorBag };
  }

  const keys = Object.keys(bag);
  if (!keys.length) return;

  const errorStatement = [];
  for (const key in bag) {
    errorStatement.push(
      `${pc.bold(pc.yellow(key))} ${pc.dim(
        pc.white('[' + bag[key].join(', ') + ']'),
      )}`,
    );
  }

  InternalLogger.error(
    meta.cls,
    `The config is missing some required options - ${errorStatement.join(', ')}`,
  );
};

const parseError = (error: ValidationError) => {
  const children = [];
  for (const child of error.children || []) {
    children.push(parseError(child));
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
};

export const getTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
};

export const isUndefined = (val: any) => {
  return val === undefined;
};

export const isClass = (obj: any) => {
  // First check if it's an object and not null
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  // Check if the constructor is not the Object constructor
  // This tells us if it was created by a class or Object literal
  return Object.getPrototypeOf(obj).constructor.name !== 'Object';
};

export const getPackageJson = () => {
  return JSON.parse(
    readFileSync(join(findProjectRoot(), 'package.json')).toString(),
  );
};
