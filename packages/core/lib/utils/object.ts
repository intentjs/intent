import { InvalidValue } from '../exceptions/invalid-value.js';
import { Arr } from './array.js';

export class Obj {
  static dot(obj: Record<string, any>): Record<string, any> {
    this.isObj(obj, true);

    const flattened = {};
    for (const key in obj) {
      if (Obj.isObj(obj[key])) {
        const temp = Obj.dot(obj[key]);
        for (const nestedKey in temp) {
          flattened[`${key}.${nestedKey}`] = temp[nestedKey];
        }
      } else {
        flattened[key] = obj[key];
      }
    }

    return flattened;
  }

  static entries(obj: Record<string, any>) {
    this.isObj(obj, true);

    const dotObject = this.dot(obj);
    const entriesArray = [] as any[][];
    for (const key in dotObject) {
      entriesArray.push([key, dotObject[key]]);
    }

    return entriesArray;
  }

  static trim(obj: Record<string, any>): Record<string, any> {
    const trimmedObj = {} as Record<string, any>;
    for (const key in obj) {
      if (Obj.isObj(obj[key])) {
        trimmedObj[key] = Obj.trim(obj[key]);
      } else if (typeof obj[key] === 'string') {
        trimmedObj[key] = obj[key].trim();
      } else {
        trimmedObj[key] = obj[key];
      }
    }

    return trimmedObj;
  }

  static pick<T>(obj: T, props: string[]): T {
    const newObj = {} as T;
    for (const prop of props) {
      if (obj[prop]) {
        newObj[prop] = obj[prop];
        continue;
      }

      const propArr = prop.split('.');
      if (Array.isArray(obj[propArr[0]])) {
        newObj[propArr[0]] = Arr.pick(obj[propArr[0]], [
          propArr.slice(1).join('.'),
        ]);
      } else if (Obj.isObj(obj[propArr[0]])) {
        newObj[propArr[0]] = Obj.pick(obj[propArr[0]], [
          propArr.slice(1).join('.'),
        ]);
      }
    }

    return { ...newObj };
  }

  static except<T>(obj: T, props: string[]): T {
    const cloneObj = { ...obj };
    for (const prop of props) {
      if (cloneObj[prop]) {
        delete cloneObj[prop];
        continue;
      }

      const propArr = prop.split('.');
      if (Array.isArray(cloneObj[propArr[0]])) {
        cloneObj[propArr[0]] = Arr.except(cloneObj[propArr[0]], [
          propArr.slice(1).join('.'),
        ]);
      } else if (Obj.isObj(cloneObj[propArr[0]])) {
        cloneObj[propArr[0]] = Obj.except(cloneObj[propArr[0]], [
          propArr.slice(1).join('.'),
        ]);
      }
    }

    return cloneObj;
  }

  static isEmpty(obj: Record<string, any>): boolean {
    Obj.isObj(obj);
    return !Object.keys(obj).length;
  }

  static isNotEmpty(obj: Record<string, any>): boolean {
    return !Obj.isEmpty(obj);
  }

  static get<T>(
    obj: Record<string, any>,
    key: string,
    ...aliasKeys: string[]
  ): T {
    const keys = [key, ...aliasKeys];
    for (const key of keys) {
      if (key in obj) return obj[key];
      const splitKeys = key.split('.');
      if (!splitKeys.length) return;

      if (Arr.isArray(obj[splitKeys[0]])) {
        return Arr.get(obj[splitKeys[0]], splitKeys.slice(1).join('.'));
      }

      if (Obj.isObj(obj[splitKeys[0]])) {
        return Obj.get(obj[splitKeys[0]], splitKeys.slice(1).join('.'));
      }
    }
    return undefined;
  }

  static sort<T = Record<string, any>>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj.sort();
    }

    if (!this.isObj(obj)) return obj;

    const keys = Object.keys(obj).sort();
    const newObj = {} as T;

    for (const key of keys) {
      if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].map(this.sort.bind(this));
      } else if (this.isObj(obj[key])) {
        newObj[key] = this.sort(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }

    return newObj;
  }

  static hash(obj: Record<string, any>): string {
    const sortedObj = this.sort(obj);
    console.log(sortedObj);
    const jsonString = JSON.stringify(sortedObj);
    console.log(jsonString);
    return '';
  }

  static asMap<T = Record<string, any>>(obj: T): Map<keyof T, any> {
    const map = new Map();
    for (const key in obj) {
      map.set(key, obj[key]);
    }
    return map;
  }

  static isObj(obj: any, throwError = false): boolean {
    let isObj =
      obj !== null &&
      typeof obj === 'object' &&
      Object.getPrototypeOf(obj) === Object.prototype;

    if (!isObj && throwError) {
      throw new InvalidValue('Passed value is not an object');
    }

    return isObj;
  }
}
