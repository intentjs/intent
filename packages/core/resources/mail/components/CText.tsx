import * as React from 'react';
import { Text } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const CText = ({ value }: ComponentProps) => {
  return <Text className={'text-txt text-base my-2'}>{value.text}</Text>;
};
