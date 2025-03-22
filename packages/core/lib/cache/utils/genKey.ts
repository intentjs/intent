import { createHash } from 'node:crypto';
import { Arr } from '../../utils/array.js';

export const genKeyFromObj = (
  obj: Record<string, any>,
  dontHash = false,
): string => {
  const keys = Object.keys(obj).sort();
  const keyStr = [];
  for (const key of keys) {
    const values = Arr.isArray(obj[key]) ? obj[key].join(',') : obj[key];
    keyStr.push(`${key}[${values}]`);
  }

  const str = keyStr.join(',');
  if (str.length > 10000 && !dontHash) {
    return createHash('sha1').update(str).digest('hex');
  }

  return str;
};
