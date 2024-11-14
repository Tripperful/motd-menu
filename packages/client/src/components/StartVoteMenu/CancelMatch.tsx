import React, { FC } from 'react';
import { motdApi } from 'src/api';
import { useGoBack } from 'src/hooks/useGoBack';
import { ConfirmDialog } from '~components/common/ConfirmDialog';

export const CancelMatch: FC = () => {
  const goBack = useGoBack();

  const onConfirm = () => {
    motdApi.clientExec('votecancel');
    motdApi.closeMenu();
  };

  return (
    <ConfirmDialog
      title="Are you sure you want to cancel this match?"
      onConfirm={onConfirm}
      onCancel={() => goBack()}
    />
  );
};
