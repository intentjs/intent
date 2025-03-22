import { LocalizationService } from '../service.js';

export const __ = (
  key: string,
  language?: string | Record<string, any>,
  options?: Record<string, any>,
): string => {
  return LocalizationService.trans(key, language, options);
};

export const transChoice = (
  key: string,
  language?: string | number,
  count?: number | Record<string, any>,
  options?: Record<string, any>,
): string => {
  return LocalizationService.transChoice(key, language, count, options);
};
