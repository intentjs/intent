import * as React from 'react';
import { Link } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const CLink = ({ value }: ComponentProps) => {
  return (
    <Link
      href={value.link}
      target="_blank"
      className={'text-link underline text-base my-2'}
    >
      {value.title}
    </Link>
  );
};
