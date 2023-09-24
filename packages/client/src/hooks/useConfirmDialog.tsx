import React, { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  content: {
    display: 'flex',
    gap: '1em',
  },
  actionButton: {
    ...outlineButton(),
    flex: '1 1 100%',
  },
});

export const useConfirmDialog = (title: string, onConfirm: () => void) => {
  const c = useStyles();
  const [show, setShow] = useState(false);

  const dialogElement = useMemo(
    () =>
      show && (
        <Popup title={title} onClose={() => setShow(false)}>
          <div className={c.content}>
            <div className={c.actionButton} onClick={() => setShow(false)}>
              No
            </div>
            <div className={c.actionButton} onClick={onConfirm}>
              Yes
            </div>
          </div>
        </Popup>
      ),
    [c.actionButton, c.content, onConfirm, show, title],
  );

  return [dialogElement, () => setShow(true)] as const;
};
