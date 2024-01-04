import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { simpleButton } from 'src/styles/elements';
import { theme } from 'src/styles/theme';
import BackIcon from '~icons/chevron-left.svg';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
    background: theme.bg1,
    '& > :nth-child(3)': {
      marginLeft: 'auto',
    },
  },
  backButton: {
    ...simpleButton(),
    backgroundColor: undefined,
    padding: '0.5em',
  },
  title: {
    fontSize: '1.5em',
  },
});

export const PageHeader: FC<{
  title: string;
  backPath?: string;
  children?: React.ReactNode;
}> = ({ title, backPath = '..', children }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Link className={c.backButton} to={backPath} relative="path">
        <BackIcon />
      </Link>
      <div className={c.title}>{title}</div>
      {children}
    </div>
  );
};
