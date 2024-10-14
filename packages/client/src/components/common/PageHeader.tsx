import React, { FC, ReactNode, Suspense } from 'react';
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
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
    minWidth: 0,
    '& h2': {
      margin: 0,
    },
    '& > :first-child': {
      marginRight: 'auto',
    },
  },
});

export const PageHeader: FC<{
  title: ReactNode;
  backPath?: string;
}> = ({ title, backPath = '..' }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Link className={c.backButton} to={backPath} relative="path">
        <BackIcon />
      </Link>
      <div className={c.title}>
        <Suspense fallback="Loading...">{title}</Suspense>
      </div>
    </div>
  );
};
