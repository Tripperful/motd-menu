import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { activeItem } from '~styles/elements';
import { ChildrenProps, ClassNameProps } from '~types/props';
import { CopyOnClick } from './CopyOnClick';
import CopyIcon from '~icons/copy.svg';
import OpenIcon from '~icons/open-in-browser.svg';
import ShareIcon from '~icons/share.svg';

const useStyles = createUseStyles({
  lineWithCopy: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  copyButton: {
    ...activeItem(),
    display: 'inline-flex',
    fontSize: '0.5em',
  },
});

export const LineWithCopy: FC<
  {
    copyText: string;
    what?: string;
    link?: {
      url: string;
      copy?: boolean;
      open?: boolean;
    };
  } & ChildrenProps &
    ClassNameProps
> = ({ copyText, what, link, children, className }) => {
  const c = useStyles();

  return (
    <div className={classNames(c.lineWithCopy, className)}>
      {children}
      <CopyOnClick copyText={copyText} what={what}>
        <div className={c.copyButton}>
          <CopyIcon />
        </div>
      </CopyOnClick>
      {link?.copy && (
        <CopyOnClick copyText={link.url} what={what + ' link'}>
          <div className={c.copyButton}>
            <ShareIcon />
          </div>
        </CopyOnClick>
      )}
      {link?.open && (
        <Link to={link.url} className={c.copyButton}>
          <OpenIcon />
        </Link>
      )}
    </div>
  );
};
