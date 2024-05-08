import classNames from 'classnames';
import React, { FC, MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { addNotification } from 'src/hooks/state/notifications';
import { copyToClipboard } from 'src/util';
import { ChildrenProps, ClassNameProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    display: 'contents',
    cursor: 'pointer',
  },
});

export const CopyOnClick: FC<
  { copyText: string; what?: string } & ChildrenProps & ClassNameProps
> = ({ copyText, what, children, className }) => {
  const c = useStyles();

  const onClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();

    copyToClipboard(copyText);

    if (what) {
      addNotification('success', what + ' copied to clipboard!');
    }
  };

  return (
    <div className={classNames(c.root, className)} onClick={onClick}>
      {children}
    </div>
  );
};
