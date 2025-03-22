import * as React from 'react';
import { Button } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const ActionButton = ({ value }: ComponentProps) => {
  return (
    <Button
      className={
        'bg-button rounded no-underline text-center py-3 my-2 cursor-pointer font-bold block text-white text-md'
      }
      href={value.link}
    >
      {value.text}
    </Button>
  );
};
