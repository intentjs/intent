import * as React from 'react';
import { Markdown } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const InjectMarkdown = ({ value }: ComponentProps) => {
  return (
    <Markdown
      markdownCustomStyles={{
        h1: { color: '#525f7f' },
        h2: { color: '#525f7f' },
        h3: { color: '#525f7f' },
        h4: { color: '#525f7f' },
        h5: { color: '#525f7f' },
        h6: { color: '#525f7f' },
        p: { color: '#525f7f' },
        codeInline: { background: 'grey' },
      }}
    >
      {value.content}
    </Markdown>
  );
};
