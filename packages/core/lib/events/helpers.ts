import { EmitsEvent } from './event.js';

export async function Emit(...events: EmitsEvent[]): Promise<void> {
  const promises = [];
  for (const event of events) {
    promises.push(event.emit());
  }
  await Promise.allSettled(promises);
}

export async function EmitIf(
  condition: boolean,
  ...events: EmitsEvent[]
): Promise<void> {
  const promises = [];
  for (const event of events) {
    promises.push(event.emitIf(condition));
  }
  await Promise.allSettled(promises);
}

export async function emitUnless(
  condition: boolean,
  ...events: EmitsEvent[]
): Promise<void> {
  const promises = [];
  for (const event of events) {
    promises.push(event.emitUnless(condition));
  }
  await Promise.allSettled(promises);
}

export function difference<T>(arr1: T[], arr2: T[]): T[] {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  const keyMap = {} as Record<string, any>;
  const difference = [] as T[];
  for (const val of arr2) {
    keyMap[val as unknown as string] = true;
  }

  for (const val of arr1) {
    if (!keyMap[val as unknown as string]) {
      difference.push(val);
    }
  }

  return difference;
}
