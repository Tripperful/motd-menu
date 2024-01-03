import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  root: {},
  submit: {
    ...outlineButton(),
    textAlign: 'center',
  },
});

export const ViewBySteamId: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const [steamId, setSteamId] = useState('');

  return (
    <Popup
      title={'View player by Steam ID'}
      onClose={goBack}
      className={c.root}
    >
      <small>Player&apos;s Steam ID 64</small>
      <input
        type="text"
        value={steamId}
        placeholder="00000000000000000"
        onChange={(e) => setSteamId(e.currentTarget.value)}
      />
      <Link to={'../' + steamId} className={c.submit}>
        View player
      </Link>
    </Popup>
  );
};
