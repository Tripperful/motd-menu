import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { usePlayerAka } from 'src/hooks/state/playerAka';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import EditIcon from '~icons/pencil.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    color: theme.fg3,
  },
  editButton: {
    ...activeItem(),
    marginLeft: '0.5em',
    flex: '0 0 auto',
    fontSize: '0.5em',
  },
});

export const PlayerAka: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();

  const aka = usePlayerAka(steamId);

  const canEdit = useCheckPermission('aka_edit');

  return (
    (aka || canEdit) && (
      <span className={c.root}>
        ({aka || 'a. k. a.'}
        {canEdit && (
          <Link className={c.editButton} to="setAka">
            <EditIcon />
          </Link>
        )}
        )
      </span>
    )
  );
};
