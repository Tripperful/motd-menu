import React, { FC, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';
import { ChildrenProps } from '~types/props';
import { PageHeader } from '../PageHeader';

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
    headerContent?: ReactNode;
    backPath?: string;
  } & ChildrenProps
> = ({ title, headerContent, backPath, children }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <PageHeader title={title} backPath={backPath}>
        {headerContent}
      </PageHeader>
      {children}
    </div>
  );
};
