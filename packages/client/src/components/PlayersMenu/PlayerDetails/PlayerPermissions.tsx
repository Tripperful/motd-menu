import {
  Permission,
  SteamPlayerData,
  allPermissions,
  permissionDescriptions,
} from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  setPlayerPermissionGranted,
  usePlayerPermissions,
} from 'src/hooks/state/permissions';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useGoBack } from 'src/hooks/useGoBack';
import { LabeledSwitch } from '~components/common/LabeledSwitch';
import { Popup } from '~components/common/Popup';

const useStyles = createUseStyles({
  content: {
    gap: '0.5em',
  },
});

const PermissionItem: FC<{
  steamId: string;
  permission: Permission;
}> = ({ steamId, permission }) => {
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

export const PlayerPermissionsPopup: FC<{ profile: SteamPlayerData }> = ({
  profile,
}) => {
  const c = useStyles();
  const goBack = useGoBack();

  return (
    <Popup
      title={`${profile.name}'s permissions`}
      onClose={goBack}
      contentClassName={c.content}
    >
      {allPermissions.map((permission) => (
        <PermissionItem
          key={permission}
          steamId={profile.steamId}
          permission={permission}
        />
      ))}
    </Popup>
  );
};
