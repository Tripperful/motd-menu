import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { Page } from '~components/common/Page';
import { PlayerSettings } from '~components/common/PlayerSettings';

const useStyles = createUseStyles({
  root: {
    padding: '0.5em',
  },
});

export const ClientSettings: FC = () => {
  const c = useStyles();
  const steamId = useMySteamId();

  return (
    <Page title={<h2>Client settings</h2>}>
      <PlayerSettings steamId={steamId} className={c.root} />
    </Page>
  );
};

export default ClientSettings;
