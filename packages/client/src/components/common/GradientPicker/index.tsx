import { HslColor, sampleGradient } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import MinusCircleIcon from '~icons/minus-circle.svg';
import PlusCircleIcon from '~icons/plus-circle.svg';
import { activeItem } from '~styles/elements';
import { ColorPicker } from '../ColorPicker';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  complexity: {
    display: 'flex',
    gap: '0.25em',
    alignItems: 'center',
    '& :first-child': {
      marginRight: 'auto',
    },
  },
  complexityButton: {
    ...activeItem(),
    fontSize: '0.75em',
  },
  gradient: {
    height: '1.5em',
    background: ({ colorStops }: { colorStops: HslColor[] }) =>
      colorStops.length === 1
        ? `hsl(${colorStops[0].h}, ${colorStops[0].s}%, ${colorStops[0].l}%)`
        : `linear-gradient(to right, ${colorStops
            .map((stop) => `hsl(${stop.h}, ${stop.s}%, ${stop.l}%)`)
            .join(', ')})`,
    position: 'relative',
    margin: '0.25em 0.75em',
  },
  colorStopWrapper: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  colorStop: {
    ...activeItem(),
    width: '1em',
    height: '2em',
    borderRadius: '0.5em',
    backgroundClip: 'content-box',
    outline: '0.15em solid currentColor',
    border: '0.15em solid black',
    scale: 0.85,
  },
  selected: {
    borderColor: 'white',
    scale: 1,
  },
});

export const GradientPicker: FC<{
  colorStops: HslColor[];
  setColorStops: (colorStops: HslColor[]) => void;
}> = ({ colorStops, setColorStops }) => {
  const c = useStyles({ colorStops });

  useEffect(() => {
    if (!colorStops.length) {
      setColorStops([{ h: 140, s: 100, l: 50 }]);
    }
  }, [colorStops]);

  const [selectedStop, setSelectedStop] = useState(0);

  const selectedStopColor = colorStops[selectedStop];

  const setSelectedStopColor = (color: HslColor) => {
    setColorStops(
      colorStops.map((stop, i) => (i === selectedStop ? color : stop)),
    );
  };

  const setGradientComplexity = (complexity: number) => {
    if (complexity < 1 || complexity > 8) return;

    const newColorStops =
      complexity === 1
        ? [colorStops[0]]
        : Array.from({ length: complexity }, (_, i) =>
            sampleGradient(colorStops, i / (complexity - 1)),
          );

    setColorStops(newColorStops);
    setSelectedStop(Math.min(selectedStop, complexity - 1));
  };

  return (
    <div className={c.root}>
      <div className={c.complexity}>
        <span>Gradient complexity</span>
        <MinusCircleIcon
          className={c.complexityButton}
          onClick={() => setGradientComplexity(colorStops.length - 1)}
        />
        {colorStops.length}
        <PlusCircleIcon
          className={c.complexityButton}
          onClick={() => setGradientComplexity(colorStops.length + 1)}
        />
      </div>
      <div className={c.gradient}>
        {colorStops.length > 1
          ? colorStops.map((stop, i) => (
              <div
                key={i}
                className={c.colorStopWrapper}
                style={{
                  left: `${Math.round((i / (colorStops.length - 1)) * 100)}%`,
                }}
                onClick={() => setSelectedStop(i)}
              >
                <div
                  className={classNames(
                    c.colorStop,
                    selectedStop === i && c.selected,
                  )}
                  style={{
                    backgroundColor: `hsl(${stop.h}, ${stop.s}%, ${stop.l}%)`,
                  }}
                />
              </div>
            ))
          : null}
      </div>
      <ColorPicker color={selectedStopColor} setColor={setSelectedStopColor} />
    </div>
  );
};
