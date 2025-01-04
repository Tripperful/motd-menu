import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { ChatCommands } from '~components/ChatCommands';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    padding: '1em',
    overflowY: 'auto',
  },
});

export const Help: FC = () => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <ChatCommands />
    </div>
  );
};

export default Help;
