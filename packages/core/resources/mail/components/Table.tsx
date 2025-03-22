import * as React from 'react';
import { ComponentProps } from './interface.js';

export const Table = ({ value }: ComponentProps) => {
  const { header, rows } = value;
  return (
    <table className="table-auto w-full bg-tableBg border-spacing-0 rounded-md pl-5 pr-5 pt-5 pb-5 my-3 border-black border-2 items-center">
      {header && (
        <thead className="uppercase">
          <tr className="w-full text-left text-[#9f9fa8] bg-tableHeader rounded-md">
            {rows[0].map((h, index) => (
              <th
                key={index}
                className={
                  (index === 0 && 'pl-3 pr-3 pt-2 pb-2 rounded-l-md') ||
                  (index === rows[0].length - 1 &&
                    'pl-3 pr-3 pt-2 pb-2 rounded-r-md') ||
                  'pl-3 pr-3 pt-2 pb-2'
                }
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}

      <tbody>
        {rows.slice(1).map((row, index) => (
          <tr key={index} className="content-center">
            {row.map((rowCol, colIndex) => (
              <td key={colIndex} className="text-txt pl-3 pr-3 pt-2 pb-2">
                {rowCol}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
