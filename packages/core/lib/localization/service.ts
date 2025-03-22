import { join } from 'path';
import { Injectable } from '@nestjs/common';
import fsExtra from 'fs-extra';
import { ConfigService } from '../config/service.js';
import { Obj } from '../utils/object.js';
import { Num } from '../utils/number.js';
import { Str } from '../utils/string.js';
import { LocalizationOptions } from './interfaces/index.js';

const { readdirSync, readFileSync } = fsExtra;

@Injectable()
export class LocalizationService {
  private static data: Record<string, any>;
  private static fallbackLang: string;
  private static caseTypes = {
    UPPER_CASE: 1,
    LOWER_CASE: 2,
    SENTENCE_CASE: 3,
    UNKNOWN: 0,
  };

  constructor(config: ConfigService) {
    const options = config.get('localization') as LocalizationOptions;

    const { path: dir, fallbackLang } = options;
    const data: Record<string, any> = {};

    LocalizationService.readFiles(
      join(dir),
      function (filename: string, content: any) {
        data[filename.split('.')[0]] = JSON.parse(content);
      },
    );

    LocalizationService.data = data;
    LocalizationService.fallbackLang = fallbackLang;
  }

  static trans(
    key: string,
    language?: string | Record<string, any>,
    options?: Record<string, any>,
  ): string {
    let langData = LocalizationService.data[this.fallbackLang];
    if (typeof language === 'string' && language != '') {
      langData = LocalizationService.data[language];
    } else {
      options = language as Record<string, any>;
    }

    let text = Obj.get(langData, key, '') as string;
    if (!text || typeof text !== 'string') return `${key}`;

    if (options) {
      for (const k in options) {
        text = this.handleOptions(text, k, options[k]);
      }
    }

    return text;
  }

  static transChoice(
    key: string,
    language?: string | number,
    count?: number | Record<string, any>,
    options?: Record<string, any>,
  ): string {
    let langData = LocalizationService.data[this.fallbackLang];
    if (typeof language === 'string' && language != '') {
      langData = LocalizationService.data[language];
    }

    if (typeof count === 'object') {
      options = count as Record<string, any>;
    }

    if (typeof language === 'number') {
      count = language as number;
    }

    if (!count && count != 0) throw new Error('Count value not found');

    const text = Obj.get(langData, key, null);
    if (!text || typeof text !== 'string') return key;

    const textObjArr: Record<string, any>[] = [];
    text.split('|').forEach((t, index) => {
      textObjArr.push(this.choiceStringParser(t, index));
    });

    let finalText = '';
    for (const t of textObjArr) {
      if (Num.inRange(count as number, [t.limit.lower, t.limit.upper])) {
        finalText = t.text;
        break;
      }
    }

    if (finalText && finalText.match(/\bcount\b/)) {
      options = { ...options, count };
    }

    if (options) {
      for (const k in options) {
        finalText = this.handleOptions(finalText, k, options[k]);
      }
    }
    return finalText ?? key;
  }

  private static choiceStringParser(
    t: string,
    index: number,
  ): Record<string, any> {
    const text: string = Str.after(t, ']').trim();
    const range = Str.between(t, '[', ']');
    const limits = Str.is(range, text)
      ? [index == 0 ? index : index + 1, index == 0 ? index + 1 : '*']
      : range.split(',');

    return {
      text,
      limit: {
        lower: limits[0] == '*' ? Number.NEGATIVE_INFINITY : +limits[0],
        upper: limits[1]
          ? limits[1] == '*'
            ? Number.POSITIVE_INFINITY
            : +limits[1]
          : +limits[0],
      },
    };
  }

  private static handleOptions(text: string, key: string, value: any): string {
    // if value is a number
    if (!isNaN(+value)) return Str.replace(text, `:${key}`, value);

    // if value is a string
    const lowerCaseText = text.toLowerCase();
    const keyStartIdx = lowerCaseText.indexOf(key);
    const identifier: string = text.substr(
      keyStartIdx,
      keyStartIdx + key.length,
    );

    const caseType = Str.isUpperCase(identifier)
      ? this.caseTypes.UPPER_CASE
      : Str.isLowerCase(identifier)
        ? this.caseTypes.LOWER_CASE
        : Str.isSentenceCase(identifier)
          ? this.caseTypes.SENTENCE_CASE
          : this.caseTypes.UNKNOWN;

    const matchStr =
      caseType === this.caseTypes.UPPER_CASE
        ? key.toUpperCase()
        : caseType === this.caseTypes.LOWER_CASE
          ? key.toLowerCase()
          : caseType === this.caseTypes.SENTENCE_CASE
            ? key[0].toUpperCase() + key.slice(1)
            : key;

    const replaceStr = () => {
      switch (caseType) {
        case this.caseTypes.UPPER_CASE:
          return value.toUpperCase();
        case this.caseTypes.LOWER_CASE:
          return value.toLowerCase();
        case this.caseTypes.SENTENCE_CASE:
          return value[0].toUpperCase() + value.slice(1);
        default:
          return value;
      }
    };

    text = Str.replace(text, `:${matchStr}`, replaceStr());
    return text;
  }

  private static readFiles(dirname: string, onFileContent: any) {
    const dirFs = readdirSync(dirname);

    dirFs.forEach((filename: string) => {
      const fileData = readFileSync(dirname + '/' + filename, {
        encoding: 'utf-8',
      });

      onFileContent(filename, fileData);
    });
  }
}
