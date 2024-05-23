import { Permission } from '@motd-menu/common';
import debounce from 'lodash/debounce';
import React, { FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useLocation } from 'react-router-dom';
import { motdApi } from 'src/api';
import { useMyPermissions } from 'src/hooks/state/permissions';
import { useSessionData } from 'src/hooks/useSessionData';
import BackIcon from '~icons/chevron-left.svg';
import CrossIcon from '~icons/close.svg';
import TelegramIcon from '~icons/telegram.svg';
import { activeItem } from '~styles/elements';
import { filterShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { QrCodePopup } from '../QrCodePopup';
import { MenuItem } from './MenuItem';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexWrap: 'wrap',
    gap: '3em',
    padding: '6em',
    position: 'relative',
    fontSize: '3vh',
  },
  dev: {
    position: 'absolute',
    right: '1em',
    top: '1em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  items: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  activeItemTitle: {
    ...filterShadow(1),
    fontSize: '2em',
    position: 'absolute',
    right: '1em',
    bottom: '50%',
    transform: 'translateY(50%)',
  },
  title: {
    ...filterShadow(1),
    position: 'absolute',
    fontSize: '2em',
    left: '1em',
    bottom: '50%',
    transform: 'translateY(50%)',
  },
  tgLink: {
    ...activeItem(),
    fontSize: '0.8em',
    position: 'absolute',
    right: '1em',
    bottom: '1em',
    display: 'flex',
    gap: '0.25em',
    alignItems: 'center',
  },
});

export interface MenuItemInfo {
  title: string;
  link: string;
  Icon: JSX.Element;
  size?: number;
  color?: string;
  permissions?: Permission[];
  shouldShow?: () => boolean;
}

const exitItem: MenuItemInfo = {
  title: 'Exit',
  link: '/exit',
  Icon: <CrossIcon />,
  size: 0.5,
};

const backItem: MenuItemInfo = {
  title: 'Back',
  link: '..',
  Icon: <BackIcon />,
  size: 0.5,
};

const buildTimestampFormat = Intl.DateTimeFormat(navigator.language, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export const Menu: FC<{ items: MenuItemInfo[]; title?: string }> = ({
  items,
  title,
}) => {
  const c = useStyles();
  const [hoveredItem, setHoveredItem] = useState<MenuItemInfo>();
  const [joinTgLink, setJoinTgLink] = useState(null as string);

  const permissions = useMyPermissions();
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (item.shouldShow && !item.shouldShow()) return false;
        if (!item.permissions) return true;
        if (item.permissions.some((p) => permissions.includes(p))) return true;
        return false;
      }),
    [items, permissions],
  );

  const totalItems = visibleItems.length;
  const radius = Math.max(6.5, totalItems * 1.5);

  const setHoveredItemDebounced = debounce(setHoveredItem, 50);
  const { pathname } = useLocation();

  const centerItem = pathname === '/' ? exitItem : backItem;

  const isDev = permissions.includes('dev');
  const { tgConnected } = useSessionData();

  return (
    <div className={c.root}>
      {isDev && (
        <div className={c.dev}>
          <div>
            Build timestamp: {buildTimestampFormat.format(BUILD_TIMESTAMP)}
          </div>
          <a href="/report.html">Bundle analyzer</a>
        </div>
      )}
      {title && <div className={c.title}>{title}</div>}
      {hoveredItem && (
        <div
          className={c.activeItemTitle}
          style={{ color: hoveredItem.color ?? theme.fg1 }}
        >
          {hoveredItem.title}
        </div>
      )}
      <div className={c.items}>
        <MenuItem
          totalItems={0}
          idx={0}
          radius={0}
          {...centerItem}
          setActive={(active) =>
            setHoveredItemDebounced(active ? centerItem : null)
          }
        />
        {visibleItems.map((item, idx) => (
          <MenuItem
            key={idx}
            totalItems={totalItems}
            idx={idx}
            radius={radius}
            {...item}
            setActive={(active) =>
              setHoveredItemDebounced(active ? item : null)
            }
          />
        ))}
      </div>
      {!tgConnected && (
        <div
          className={c.tgLink}
          onClick={() => {
            motdApi.getTgJoinLink().then((link) => setJoinTgLink(link));
          }}
        >
          <TelegramIcon /> Connect Telegram
        </div>
      )}
      {joinTgLink && (
        <QrCodePopup
          title="Connect to Telegram"
          description="Scan the QR code with your phone or copy the link and paste it to your browser to start receiving notifications from us."
          link={joinTgLink}
          onClose={() => setJoinTgLink(null)}
        />
      )}
    </div>
  );
};
