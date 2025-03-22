import stringToPath from './stringToPath.js';

// function baseGet(object: Record<string, any>, path: any): any {
//   path = castPath(path, object);

//   let index = 0;
//   const length = path.length;

//   while (object != null && index < length) {
//     object = object[toKey(path[index++])];
//   }
//   return index && index == length ? object : undefined;
// }

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function getTag(value: string): any {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value: string, object: Record<string, any>): any {
  if (Array.isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(value);
}

const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value: any, object: Record<string, any>): boolean {
  if (Array.isArray(value)) {
    return false;
  }
  const type = typeof value;
  if (
    type === 'number' ||
    type === 'boolean' ||
    value == null ||
    isSymbol(value)
  ) {
    return true;
  }
  return (
    reIsPlainProp.test(value) ||
    !reIsDeepProp.test(value) ||
    (object != null && value in Object(object))
  );
}

/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value: number): any {
  if (typeof value === 'string' || isSymbol(value)) {
    return value;
  }
  const result = `${value}`;
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

function isSymbol(value: any): boolean {
  const type = typeof value;
  return (
    type == 'symbol' ||
    (type === 'object' && value != null && getTag(value) == '[object Symbol]')
  );
}
