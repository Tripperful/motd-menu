import { Permission } from '@motd-menu/common';
import debounce from 'lodash/debounce';
import React, { FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useLocation } from 'react-router-dom';
import { useMyPermissions } from 'src/hooks/useMyPermissions';
import BackIcon from '~icons/chevron-left.svg';
import CrossIcon from '~icons/close.svg';
import { filterShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
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
  },
  buildTimestamp: {
    position: 'absolute',
    right: '1em',
    top: '1em',
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
    color: theme.fg1,
    position: 'absolute',
    left: '50%',
    top: '10%',
    transform: 'translateX(-50%)',
  },
  hint: {
    ...filterShadow(1),
    position: 'absolute',
    left: '50%',
    top: '90%',
    transform: 'translateX(-50%)',
  },
});

export interface MenuItemInfo {
  title: string;
  link: string;
  Icon: FC;
  size?: number;
  color?: string;
  permissions?: Permission[];
}

const exitItem: MenuItemInfo = {
  title: 'Exit',
  link: '/exit',
  Icon: CrossIcon,
  size: 0.5,
};

const backItem: MenuItemInfo = {
  title: 'Back',
  link: '..',
  Icon: BackIcon,
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

export const Menu: FC<{ items: MenuItemInfo[]; hint?: string }> = ({
  items,
  hint,
}) => {
  const c = useStyles();
  const [hoveredItem, setHoveredItem] = useState<MenuItemInfo>();

  const permissions = useMyPermissions();
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (!item.permissions) return true;
        if (item.permissions.some((p) => permissions.includes(p))) return true;
        return false;
      }),
    [items, permissions],
  );

  const totalItems = visibleItems.length;
  const radius = Math.max(4, totalItems);

  const setHoveredItemDebounced = debounce(setHoveredItem, 50);
  const { pathname } = useLocation();

  const centerItem = pathname === '/' ? exitItem : backItem;

  return (
    <div className={c.root}>
      {permissions.includes('dev') && (
        <div className={c.buildTimestamp}>
          Build timestamp: {buildTimestampFormat.format(BUILD_TIMESTAMP)}
        </div>
      )}
      {hoveredItem && (
        <div className={c.activeItemTitle}>{hoveredItem.title}</div>
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
      {hint && <div className={c.hint}>{hint}</div>}
    </div>
  );
};
