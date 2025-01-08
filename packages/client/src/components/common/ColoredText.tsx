import { HslColor, sampleGradient } from '@motd-menu/common';
import React, { FC, HTMLAttributes } from 'react';

export const ColoredText: FC<
  HTMLAttributes<HTMLSpanElement> & { text: string; colorStops: HslColor[] }
> = ({ text, colorStops, ...props }) => {
  return (
    <span {...props}>
      {text.split('').map((c, i) => {
        const charColor = sampleGradient(colorStops, i / text.length);
        return (
          <span
            key={i}
            style={{
              color: `hsl(${charColor.h}, ${charColor.s}%, ${charColor.l}%)`,
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
};
