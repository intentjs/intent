import * as React from 'react';
import { CodeBlock, oneDark } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const CodeSnippets = ({ value, theme }: ComponentProps) => {
  const { content, options = {} } = value;
  return (
    <CodeBlock
      style={{
        lineHeight: 0.6,
        paddingTop: '0px',
        paddingBottom: '0px',
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
      }}
      code={content}
      theme={theme?.isDarkThemed ? oneDark : oneDark}
      language={options?.lang || 'jsx'}
    />
  );
};
