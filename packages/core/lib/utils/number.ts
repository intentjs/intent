import { ConfigService } from '../config/service.js';

interface NumOptions {
  precision?: number;
  locale?: string;
  currency?: string;
}

export class Num {
  static inRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1];
  }

  static abbreviate(num: number, options?: NumOptions): string {
    const locale =
      options?.locale ?? (ConfigService.get('app.locale') as string);
    return Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: options?.precision ?? 1,
    }).format(num);
  }

  static clamp(num: number, min: number, max: number): number {
    return Num.inRange(num, [min, max]) ? num : num < min ? min : max;
  }

  static currency(num: number, options?: NumOptions): string {
    const locale =
      options?.locale ?? (ConfigService.get('app.locale') as string);
    const currency =
      options?.currency ?? (ConfigService.get('app.currency') as string);
    return Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(num);
  }

  // return type -
  static fileSize(num: number, options?: NumOptions): string {
    return new Intl.NumberFormat([], {
      style: 'unit',
      unit: 'byte',
      notation: 'compact',
      unitDisplay: 'narrow',
      maximumFractionDigits: options?.precision ?? 1,
    }).format(num);
  }

  static forHumans(num: number, options?: NumOptions): string {
    const locale =
      options?.locale ?? (ConfigService.get('app.locale') as string);
    return Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'long',
      maximumFractionDigits: options?.precision ?? 1,
    }).format(num);
  }

  static format(num: number, options?: NumOptions): string {
    const locale =
      options?.locale ?? (ConfigService.get('app.locale') as string);
    return Intl.NumberFormat(locale, {
      maximumFractionDigits: options?.precision ?? 1,
    }).format(num);
  }

  static percentage(num: number, options?: NumOptions): string {
    const locale =
      options?.locale ?? (ConfigService.get('app.locale') as string);
    return Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: options?.precision ?? 1,
      maximumFractionDigits: options?.precision ?? 1,
    }).format(num / 100);
  }

  static ordinal(num: number): string {
    if (Num.inRange(num, [4, 20])) return `${num}th`;
    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  }

  static spell(num: number | string): string {
    const numWords = [
      '',
      'one ',
      'two ',
      'three ',
      'four ',
      'five ',
      'six ',
      'seven ',
      'eight ',
      'nine ',
      'ten ',
      'eleven ',
      'twelve ',
      'thirteen ',
      'fourteen ',
      'fifteen ',
      'sixteen ',
      'seventeen ',
      'eighteen ',
      'nineteen ',
    ];
    const tens = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num)
      .slice(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str +=
      Number(n[1]) != 0
        ? (numWords[Number(n[1])] || tens[n[1][0]] + ' ' + numWords[n[1][1]]) +
          'crore '
        : '';
    str +=
      Number(n[2]) != 0
        ? (numWords[Number(n[2])] || tens[n[2][0]] + ' ' + numWords[n[2][1]]) +
          'lakh '
        : '';
    str +=
      Number(n[3]) != 0
        ? (numWords[Number(n[3])] || tens[n[3][0]] + ' ' + numWords[n[3][1]]) +
          'thousand '
        : '';
    str +=
      Number(n[4]) != 0
        ? (numWords[Number(n[4])] || tens[n[4][0]] + ' ' + numWords[n[4][1]]) +
          'hundred '
        : '';
    str +=
      Number(n[5]) != 0
        ? (str != '' ? 'and ' : '') +
          (numWords[Number(n[5])] || tens[n[5][0]] + ' ' + numWords[n[5][1]]) +
          'only'
        : '';
    return str;
  }

  static isInteger(num: any) {
    return Number.isInteger(num);
  }
}
