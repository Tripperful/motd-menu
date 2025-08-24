import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { Page } from '~components/common/Page';
import { PlayerSettings } from '~components/common/PlayerSettings';
import { verticalScroll } from '~styles/elements';

const useStyles = createUseStyles({
  content: {
    ...verticalScroll(),
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
  },
});

export const ClientSettings: FC = () => {
  const c = useStyles();
  const steamId = useMySteamId();

  return (
    <Page title={<h2>Client settings</h2>}>
      <PlayerSettings steamId={steamId} className={c.content} />
    </Page>
  );
};

export default ClientSettings;
