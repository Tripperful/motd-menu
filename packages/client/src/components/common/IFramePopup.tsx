import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Popup } from './Popup';

const useStyles = createUseStyles({
  root: {
    width: 'calc(100vw - 4em)',
    height: 'calc(100vh - 6em)',
  },
});

export const IFramePopup: FC<{
  title: string;
  url: string;
  onClose: () => void;
}> = ({ title, url, onClose }) => {
  const c = useStyles();

  return (
    <Popup title={title} onClose={onClose} noContentWrapper>
      <iframe src={url} className={c.root} />
    </Popup>
  );
};
