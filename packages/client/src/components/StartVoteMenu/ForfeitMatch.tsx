import React, { FC } from 'react';
import { motdApi } from 'src/api';
import { useGoBack } from 'src/hooks/useGoBack';
import { ConfirmDialog } from '~components/common/ConfirmDialog';

export const ForfeitMatch: FC = () => {
  const goBack = useGoBack();

  const onConfirm = () => {
    motdApi.clientExec('forfeit');
    motdApi.closeMenu();
  };

  return (
    <ConfirmDialog
      title="Are you sure you want to give up?"
      onConfirm={onConfirm}
      onCancel={() => goBack()}
    />
  );
};
