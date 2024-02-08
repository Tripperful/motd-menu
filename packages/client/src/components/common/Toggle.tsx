import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { activeItem } from 'src/styles/elements';
import { ChildrenProps, ClassNameProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    ...activeItem(),
  },
});

export const Toggle: FC<
  ChildrenProps &
    ClassNameProps & {
      active: boolean;
      setActive?: (active: boolean) => void;
      disabled?: boolean;
    }
> = ({ active, setActive, disabled, children, className }) => {
  const c = useStyles();
  className = classNames(c.root, className);

  disabled ||= !setActive;

  const onClick = () => {
    if (disabled) return;
    setActive(!active);
  };

  return (
    <div
      className={className}
      onClick={onClick}
      data-active={active}
      data-disabled={disabled}
    >
      {children}
    </div>
  );
};
