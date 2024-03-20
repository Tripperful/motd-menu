import classNames from 'classnames';
import React, { FC, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { simpleButton } from 'src/styles/elements';
import { popin } from '~styles/animations';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    borderRadius: '100em',
  },
  '@keyframes popin': popin,
  button: {
    ...simpleButton(),
    backgroundColor: theme.bg1,
    borderRadius: '100em',
    padding: '0.5em',
    fontSize: '2.5em',
    animation: '$popin 0.1s ease-in',
  },
});

export const MenuItem: FC<{
  link?: string;
  onClick?: () => void;
  setActive: (active: boolean) => void;
  totalItems: number;
  idx: number;
  radius: number;
  Icon: JSX.Element;
  size?: number;
  className?: string;
  color?: string;
}> = ({
  link,
  onClick,
  setActive,
  totalItems,
  idx,
  radius,
  Icon,
  size = 1,
  className,
  color,
}) => {
  const c = useStyles();

  const transform = useMemo(() => {
    const deg = ((Math.PI * 2) / totalItems) * idx - Math.PI / 2;

    return `translate(calc(-50% + ${Math.cos(deg) * radius}em), calc(-50% + ${
      Math.sin(deg) * radius
    }em))`;
  }, [idx, radius, totalItems]);

  return (
    <Link
      to={link}
      relative="path"
      onClick={onClick}
      style={{ transform, fontSize: size + 'em' }}
      className={classNames(c.root, className)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className={c.button} style={{ color }}>
        {Icon}
      </div>
    </Link>
  );
};
