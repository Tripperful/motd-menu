import classNames from 'classnames';
import React, { FC, ReactNode, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { ChildrenProps, ClassNameProps } from '~types/props';
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
  } & ChildrenProps &
    ClassNameProps
> = ({ title, backPath, children, className }) => {
  const c = useStyles();

  return (
    <div className={classNames(c.root, className)}>
      <PageHeader title={title} backPath={backPath} />
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </div>
  );
};
