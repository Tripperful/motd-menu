import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { steamProfileLink } from 'src/util';
import { activeItemNoTransform } from '~styles/elements';
import { ConfirmDialog } from './ConfirmDialog';
import { CopyOnClick } from './CopyOnClick';

const useStyles = createUseStyles({
  copy: {
    ...activeItemNoTransform(),
  },
});

const ReplaceConfirmContent: FC<{
  initiatorSteamId: string;
  whomSteamId: string;
}> = ({ initiatorSteamId, whomSteamId }) => {
  const c = useStyles();

  const initiator = usePlayerSteamProfile(initiatorSteamId);
  const whom = usePlayerSteamProfile(whomSteamId);

  return (
    <div>
      <CopyOnClick
        className={c.copy}
        copyText={steamProfileLink(initiatorSteamId)}
        what="Profile link"
      >
        {initiator?.name}
      </CopyOnClick>{' '}
      asked you to replace{' '}
      <CopyOnClick
        className={c.copy}
        copyText={steamProfileLink(initiatorSteamId)}
        what="Profile link"
      >
        {whom?.name}
      </CopyOnClick>{' '}
      in this match, do you agree to play?
    </div>
  );
};

export const ReplaceConfirm: FC = () => {
  const { initiatorSteamId, whomSteamId } = useParams();

  const onConfirm = () => {
    motdApi.closeMenu();
    motdApi.confirmReplacePlayer(whomSteamId);
  };

  const onCancel = () => {
    motdApi.closeMenu();
  };

  return (
    <ConfirmDialog
      title="Replace player?"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <ReplaceConfirmContent
        initiatorSteamId={initiatorSteamId}
        whomSteamId={whomSteamId}
      />
    </ConfirmDialog>
  );
};
