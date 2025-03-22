import * as React from 'react';
import { Heading } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const Greetings = ({ value }: ComponentProps) => {
  return (
    <Heading as="h3" className="text-bold text-txt">
      {value.text}
    </Heading>
  );
};
