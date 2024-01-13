import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Page } from '~components/common/Page';
import { MatchCvars } from './MatchCvars';

const useStyles = createUseStyles({
  root: {},
});

export const MatchMenu: FC = () => {
  const c = useStyles();

  return (
    <Page title="Match menu">
      <div className={c.root}>
        <MatchCvars />
      </div>
    </Page>
  );
};
