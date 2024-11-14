import classNames from 'classnames';
import React, { FC, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';
import { ChildrenProps, ClassNameProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    maxWidth: '30em',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '1em',
  },
  actionButton: {
    ...outlineButton(),
    flex: '0 1 10em',
  },
});

export const ConfirmDialog: FC<
  {
    title: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
  } & ChildrenProps &
    ClassNameProps
> = ({ title, onConfirm, onCancel, children, className }) => {
  const c = useStyles();

  return (
    <Popup
      title={title}
      onClose={onCancel}
      className={classNames(c.root, className)}
    >
      {children}
      <div className={c.buttons}>
        <div className={c.actionButton} onClick={onCancel}>
          No
        </div>
        <div className={c.actionButton} onClick={onConfirm}>
          Yes
        </div>
      </div>
    </Popup>
  );
};
