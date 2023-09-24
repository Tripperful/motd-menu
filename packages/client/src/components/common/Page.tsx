import React, { FC, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';
import { ChildrenProps } from '~types/props';
import { PageHeader } from './PageHeader';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
});

export const Page: FC<
  { title: string; headerContent?: ReactNode } & ChildrenProps
> = ({ title, headerContent, children }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <PageHeader title={title}>{headerContent}</PageHeader>
      {children}
    </div>
  );
};
