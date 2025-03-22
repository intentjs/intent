import * as React from 'react';

import { Heading, Img, Section } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const Header = ({ value, className }: ComponentProps) => {
  const { logo, title } = value;
  return (
    <Section className={className ?? 'flex flex-col'}>
      {logo && <Img src={logo?.src} alt={logo?.alt} height={32} />}
      {title && (
        <Heading className={'text-txt font-bold'} as="h2">
          {title}
        </Heading>
      )}
    </Section>
  );
};
