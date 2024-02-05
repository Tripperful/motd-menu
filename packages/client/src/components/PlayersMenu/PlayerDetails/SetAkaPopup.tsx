import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { setPlayerAka, usePlayerAka } from 'src/hooks/state/playerAka';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  root: {},
  button: {
    ...outlineButton(),
  },
});

export const SetAkaPopup: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const initialAka = usePlayerAka(steamId);
  const [aka, setAka] = useState(initialAka);

  const onSubmit = async () => {
    try {
      await motdApi.setPlayerAka(steamId, aka || null);
      setPlayerAka(steamId, aka || null);
      addNotification('success', `Saved`);
    } catch {
      addNotification('error', 'Failed to set a. k. a.');
    }
    goBack();
  };

  return (
    <Popup title={'Set player alias'} onClose={goBack} className={c.root}>
      <small>Leave blank to remove</small>
      <input
        type="text"
        value={aka}
        placeholder="Player alias"
        onChange={(e) => setAka(e.currentTarget.value)}
      />
      <div className={c.button} onClick={onSubmit}>
        Set name
      </div>
    </Popup>
  );
};
