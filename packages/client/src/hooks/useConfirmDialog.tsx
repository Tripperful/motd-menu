import React, { useMemo, useState } from 'react';
import { ConfirmDialog } from '~components/common/ConfirmDialog';

export const useConfirmDialog = (
  title: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  const [show, setShow] = useState(false);

  const dialogElement = useMemo(
    () =>
      show && (
        <ConfirmDialog
          title={title}
          onConfirm={() => {
            setShow(false);
            onConfirm();
          }}
          onCancel={() => {
            setShow(false);
            onCancel?.();
          }}
        />
      ),
    [onConfirm, show, title],
  );

  return [dialogElement, () => setShow(true)] as const;
};
