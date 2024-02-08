import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';
import { Toggle } from './Toggle';

const useStyles = createUseStyles({
  toggle: {
    ...activeItem(),
    borderRadius: '2em',
    border: '0.2em solid currentColor',
    padding: '0.2em',
    boxSizing: 'content-box',
    width: '2.25em',
    height: 'min-content',
    flexGrow: 0,
    flexShrink: 0,
  },
  knob: {
    backgroundColor: theme.fg1,
    transition:
      'transform 0.25s ease-out, width 0.25s ease-out, opacity 0.25s ease-out',
    transform: 'translateX(0)',
    width: '0.75em',
    height: '0.75em',
    borderRadius: '1em',
  },
  unknown: {
    width: '2.25em',
    opacity: 0.2,
  },
  active: {
    transform: 'translateX(1.5em)',
  },
});

export const Switch: FC<{
  active: boolean | null;
  setActive?: (active: boolean) => void;
  disabled?: boolean;
}> = ({ active, setActive, disabled }) => {
  const c = useStyles();

  return (
    <Toggle
      active={active}
      setActive={setActive}
      disabled={disabled}
      className={c.toggle}
    >
      <div
        className={classNames(
          c.knob,
          active && c.active,
          active == null && c.unknown,
        )}
      ></div>
    </Toggle>
  );
};
