import { HslColor } from '@motd-menu/common';
import React, { FC, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { theme } from '~styles/theme';
import { ColoredText } from '../ColoredText';
import { GradientPicker } from '../GradientPicker';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    width: '20em',
  },
  textWrapper: {
    position: 'relative',
    whiteSpace: 'pre',
  },
  input: {
    '&&': {
      color: 'transparent',
      caretColor: theme.fg2,
      width: '100%',
    },
  },
  display: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    padding: '0.5em',
  },
  title: {
    fontSize: '0.8em',
  },
});

export const TextColorer: FC<{
  text: string;
  setText: (text: string) => void;
  colorStops: HslColor[];
  setColorStops: (colorStops: HslColor[]) => void;
  maxTextLength?: number;
}> = ({ text, setText, colorStops, setColorStops, maxTextLength }) => {
  const c = useStyles();

  useEffect(() => {
    if (text.length > maxTextLength) {
      setText(text.substring(0, maxTextLength));
    }
  }, [text, maxTextLength]);

  return (
    <div className={c.root}>
      {maxTextLength ? (
        <div className={c.title}>{`${text.length}/${maxTextLength} characters`}</div>
      ) : null}
      <div className={c.textWrapper}>
        <ColoredText
          className={c.display}
          text={text}
          colorStops={colorStops}
        />
        <input
          className={c.input}
          type="text"
          value={text}
          onChange={(e) =>
            setText(e.currentTarget.value.substring(0, maxTextLength))
          }
        />
      </div>
      <GradientPicker colorStops={colorStops} setColorStops={setColorStops} />
    </div>
  );
};
