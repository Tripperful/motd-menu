import { getEditableCvars, getViewableCvars } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useSessionData } from 'src/hooks/useSessionData';
import { ServerCvarControl } from '~components/common/CvarControl';
import { Page } from '~components/common/Page';

const useStyles = createUseStyles({
  root: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    overflow: 'hidden auto',
  },
});

export const ServerSettings: FC = () => {
  const c = useStyles();
  const { permissions } = useSessionData();

  const viewableCvars = getViewableCvars(permissions);
  const editableCvars = getEditableCvars(permissions);

  return (
    <Page title="Server settings">
      <div className={c.root}>
        {viewableCvars?.map((cvar) => (
          <ServerCvarControl
            key={cvar}
            cvar={cvar}
            disabled={!editableCvars.includes(cvar)}
          />
        ))}
      </div>
    </Page>
  );
};
