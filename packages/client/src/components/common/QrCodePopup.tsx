import React, { FC, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';
import QrCode from 'react-qr-code';
import { useGoBack } from 'src/hooks/useGoBack';
import CopyIcon from '~icons/copy.svg';
import { outlineButton } from '~styles/elements';
import { CopyOnClick } from './CopyOnClick';
import { Popup } from './Popup';

const useStyles = createUseStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1em',
    width: '15em',
  },
  description: {
    textAlign: 'center',
    fontSize: '0.8em',
  },
  qrBg: {
    backgroundColor: 'white',
    padding: '1em',
  },
  qr: {
    width: '10em',
    height: '10em',
  },
  copyLinkButton: {
    ...outlineButton(),
  },
});

export const QrCodePopup: FC<{
  title: ReactNode;
  description?: ReactNode;
  link: string;
  onClose?: () => void;
}> = ({ title, description, link, onClose }) => {
  const c = useStyles();
  const goBack = useGoBack();

  return (
    <Popup title={title} onClose={onClose ?? goBack}>
      <div className={c.content}>
        {description && <div className={c.description}>{description}</div>}
        <div className={c.qrBg}>
          <QrCode value={link} className={c.qr} />
        </div>
        <CopyOnClick what="Link" copyText={link}>
          <div className={c.copyLinkButton}>
            <CopyIcon /> Copy link
          </div>
        </CopyOnClick>
      </div>
    </Popup>
  );
};
