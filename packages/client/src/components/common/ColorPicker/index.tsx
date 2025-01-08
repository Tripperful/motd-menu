import { HslColor } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  slider: {
    '-webkit-appearance': 'none',
    outline: 'none',
    borderRadius: '1em',
    '&::-webkit-slider-thumb': {
      '-webkit-appearance': 'none',
      ...activeItem(),
      width: '2em',
      height: '2em',
      borderRadius: '1em',
      background: 'transparent',
      border: '0.25em solid black',
      outline: '0.25em solid currentColor',
      margin: '-0.15em',
    },
  },
  hSlider: {
    background: theme.rainbowGradient,
  },
  colorPreviewWrapper: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPreview: {
    height: '1em',
    width: '2em',
    borderRadius: '1em',
    border: '0.15em solid black',
    outline: `0.15em solid ${theme.fg2}`,
  },
});

export const ColorPicker: FC<{
  color: HslColor;
  setColor: (color: HslColor) => void;
}> = ({ color, setColor }) => {
  const c = useStyles();

  const { h, s, l } = color;
  const setH = (h: number) => setColor({ h, s, l });
  const setS = (s: number) => setColor({ h, s, l });
  const setL = (l: number) => setColor({ h, s, l });

  return (
    <div className={c.root}>
      <div className={c.colorPreviewWrapper}>
        <span>Selected color</span>
        <span
          className={c.colorPreview}
          style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
        />
      </div>
      <input
        className={classNames(c.slider, c.hSlider)}
        type="range"
        min={0}
        max={360}
        value={h}
        onChange={(e) => setH(Number(e.target.value))}
      />
      <input
        className={c.slider}
        style={{
          background: `linear-gradient(to right, #888, hsl(${h}, 100%, 50%))`,
        }}
        type="range"
        min={0}
        max={100}
        value={s}
        onChange={(e) => setS(Number(e.target.value))}
      />
      <input
        className={c.slider}
        style={{
          background: `linear-gradient(to right, black, hsl(${h}, ${s}%, 50%), white)`,
        }}
        type="range"
        min={0}
        max={100}
        value={l}
        onChange={(e) => setL(Number(e.target.value))}
      />
    </div>
  );
};
