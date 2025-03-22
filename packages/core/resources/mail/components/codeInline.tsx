import * as React from 'react';
import { ComponentProps } from './interface.js';

export const ICodeInline = ({ value }: ComponentProps) => {
  return (
    <code className="bg-code text-txt block py-3 px-3 rounded text-md">
      {value.content}
    </code>
  );
};
