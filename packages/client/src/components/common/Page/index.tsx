import React, { FC, ReactNode, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { ChildrenProps } from '~types/props';
import { PageHeader } from '../PageHeader';
import { Spinner } from '../Spinner';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
});

export const Page: FC<
  {
    title: ReactNode;
    backPath?: string;
  } & ChildrenProps
> = ({ title, backPath, children }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <PageHeader title={title} backPath={backPath} />
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </div>
  );
};
