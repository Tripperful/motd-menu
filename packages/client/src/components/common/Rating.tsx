import React, { CSSProperties, FC, MouseEventHandler, useState } from 'react';
import { createUseStyles } from 'react-jss';

import classNames from 'classnames';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';

const maxRate = 5;

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stars: {
    '&::after': {
      content: "'★★★★★'",
      lineHeight: 0.8,
      fontSize: '2em',
      backgroundImage: `linear-gradient(90deg, ${theme.fg1} var(--rate), ${theme.bg2} var(--rate))`,
      WebkitTextFillColor: 'transparent',
      WebkitBackgroundClip: 'text',
    },
  },
});

export const Rating: FC<
  {
    rate: number;
    setRate?: (rate: number) => void;
  } & ClassNameProps
> = ({ rate, setRate, className }) => {
  const c = useStyles();

  const [hoveredRate, setHoveredRate] = useState(0);

  const onMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!setRate) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.pageX - rect.x) / rect.width;

    setHoveredRate(Math.ceil(percent * maxRate));
  };

  const onMouseLeave: MouseEventHandler<HTMLDivElement> = () => {
    if (!setRate) return;

    setHoveredRate(null);
  };

  const onClick: MouseEventHandler = () => {
    if (!setRate) return;

    setRate(hoveredRate);
  };

  const displayedRate = rate ?? hoveredRate;
  const displayedRatePercent = (displayedRate / maxRate) * 100 + '%';

  const style = { '--rate': displayedRatePercent } as CSSProperties;

  return (
    <div className={classNames(c.root, className)} style={style}>
      <div
        className={c.stars}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onClick={onClick}
      ></div>
    </div>
  );
};
