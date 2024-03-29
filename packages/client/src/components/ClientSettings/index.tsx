import React, { FC, Suspense } from 'react';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { Page } from '~components/common/Page';
import { PlayerSettings } from '~components/common/PlayerSettings';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {
    padding: '0.5em',
  },
});

export const ClientSettings: FC = () => {
  const c = useStyles();
  const steamId = useMySteamId();

  return (
    <Page title="Client settings">
      <Suspense>
        <PlayerSettings steamId={steamId} className={c.root} />
      </Suspense>
    </Page>
  );
};

export default ClientSettings;
