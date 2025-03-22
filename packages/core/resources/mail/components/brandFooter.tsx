import * as React from 'react';
import { Hr, Img, Section, Text } from '@react-email/components';
import { ComponentProps } from './interface.js';

export const BrandFooter = ({ value }: ComponentProps) => {
  const { logo, title } = value;
  return (
    <div className="mt-5 px-8">
      <div className="flex justify-between items-center">
        <div>
          {logo && <Img src={logo?.src} alt={logo?.alt} height={32} />}
          {title && (
            <Text className="text-txt text-lg font-semibold">
              {title?.text}
            </Text>
          )}
        </div>
        <div className="flex flex-row justify-end gap-4">
          <Img
            src={'https://avatars.githubusercontent.com/u/159687000?s=200&v=4'}
            alt="discord"
            width={22}
            height={22}
            className="cursor-pointer"
          />
        </div>
      </div>

      <Section className="my-2">
        <Hr />
      </Section>

      <div>
        <Text className="text-txt text-center">
          Contact Us: hi@tryintent.com
          <br />
          {`Copyright © ${new Date().getFullYear()} Intent. All rights
          reserved.`}
        </Text>
      </div>
    </div>
  );
};
