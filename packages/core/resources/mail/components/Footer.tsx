import * as React from 'react';
import { Img, Text } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const Footer = ({ value }: ComponentProps) => {
  const { logo, title, appName } = value;
  return (
    <>
      {logo && <Img src={logo?.src} alt={logo?.alt} width={40} />}
      {/* {title && <Text className={'text-txt text-sm'}>{title?.text}</Text>} */}
      {/* {subtitle && <Text className={'text-txt text-xs'}>{subtitle?.text}</Text>} */}
      <div>
        <Text className="text-txt text-xs text-center">
          {title}
          <br />
          {`Copyright © ${new Date().getFullYear()} ${appName}. All rights
          reserved.`}
        </Text>
      </div>
    </>
  );
};
