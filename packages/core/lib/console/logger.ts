import Table from 'cli-table3';
import pc from 'picocolors';
import { Str } from '../utils/string.js';

export class ConsoleLogger {
  /**
   * Use this method to print an information line
   * @param msg
   * @returns void
   */
  public static info(msg: string): void {
    console.log(pc.cyan(msg));
  }

  /**
   * Use this method to print a warning message
   * @param msg
   * @returns void
   */
  public static warn(msg: string): void {
    console.log(pc.yellow(msg));
  }

  /**
   * Use this method to print an error message
   * @param msg
   * @returns void
   */
  static error(msg: string): void {
    console.log(pc.bgRed(pc.bold(msg)));
  }

  /**
   * Use this method to print a line.
   * Prints line half the width of the console
   * @returns void
   */
  static line(): void {
    console.log(pc.gray('-'.repeat(process.stdout.columns / 2)));
  }

  /**
   * Use this method to print a success message
   * @param msg
   * @returns void
   */
  static success(msg: string) {
    console.log(pc.green(msg));
  }

  /**
   * Use this function to print table in console
   * @param rows
   * @param options
   * @returns void
   */
  static table(headers: string[], rows: Record<string, any>[]): void {
    const formattedHeaders = [];
    for (const header of headers) {
      formattedHeaders.push(pc.cyan(pc.bold(header)));
    }

    const pRows: string[][] = [];

    for (const header of headers) {
      for (const [index, row] of rows.entries()) {
        if (!pRows[index]) {
          pRows[index] = [] as string[];
        }

        pRows[index].push(row[Str.camel(header)]);
      }
    }

    const p = new Table({ head: formattedHeaders });
    p.push(...pRows);

    console.log(p.toString());
  }
}
