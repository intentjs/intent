import { Str } from './string.js';

export const columnify = (
  rows: Record<string, any>[],
  options?: Record<string, any>,
) => {
  const formattedRows: string[][] = rows.map(row => Object.values(row));
  const maxColumns = findMaxColumns(formattedRows);
  for (let i = 0; i < maxColumns; i++) {
    const colValues = findAllColumnsAtIndex(formattedRows, i);
    const maxLength = findMaxLength(colValues);
    for (const row of formattedRows) {
      row[i] = Str.padRight(row[i], maxLength, ' ');
      if (options?.padStart) {
        row[i] = Str.padLeft('', options.padStart, ' ').concat(row[i]);
      }
    }
  }

  return formattedRows;
};

const findAllColumnsAtIndex = (rows: string[][], index: number): string[] => {
  const columns = [];
  for (const row of rows) {
    columns.push(row[index]);
  }

  return columns;
};

const findMaxLength = (values: string[]): number => {
  let maxLength = values[0].length;
  for (const value of values) {
    if (maxLength <= value.length) {
      maxLength = value.length;
    }
  }

  return maxLength;
};

const findMaxColumns = (rows: string[][]): number => {
  let maxColumns = rows[0].length;
  for (const row of rows) {
    if (maxColumns < row.length) {
      maxColumns = row.length;
    }
  }

  return maxColumns;
};
