import React, { FC, MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { addNotification } from 'src/hooks/state/notifications';
import { copyToClipboard } from 'src/util';
import { ChildrenProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    display: 'contents',
    cursor: 'pointer',
  },
});

export const CopyOnClick: FC<
  { copyText: string; what?: string } & ChildrenProps
> = ({ copyText, what, children }) => {
  const c = useStyles();

  const onClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();

    copyToClipboard(copyText);

    if (what) {
      addNotification('info', what + ' copied to clipboard!');
    }
  };

  return (
    <div className={c.root} onClick={onClick}>
      {children}
    </div>
  );
};
