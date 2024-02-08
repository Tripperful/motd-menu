import {
  Permission,
  allPermissions,
  permissionDescriptions,
} from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  setPlayerPermissionGranted,
  usePlayerPermissions,
} from 'src/hooks/state/permissions';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { LabeledSwitch } from '~components/common/LabeledSwitch';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
});

const PermissionItem: FC<{
  permission: Permission;
}> = ({ permission }) => {
  const { steamId } = useParams();

  const canEdit = useCheckPermission('permissions_edit');
  const granted = usePlayerPermissions(steamId).includes(permission);

  const setGranted = async (permission: Permission, grant: boolean) => {
    try {
      if (grant) {
        motdApi.grantPlayerPermission(steamId, permission);
      } else {
        motdApi.withdrawPlayerPermission(steamId, permission);
      }

      setPlayerPermissionGranted(steamId, permission, grant);
    } catch {
      addNotification('error', 'Failed to edit permission!');
    }
  };

  return (
    <LabeledSwitch
      active={granted}
      setActive={(grant) => setGranted(permission, grant)}
      disabled={!canEdit}
      label={permissionDescriptions[permission]}
    />
  );
};

export const PlayerPermissions: FC = () => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <div>Permissions</div>
      {allPermissions.map((permission) => (
        <PermissionItem key={permission} permission={permission} />
      ))}
    </div>
  );
};
