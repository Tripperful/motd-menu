import { Permission } from '@motd-menu/common';
import { useMyPermissions } from './state/permissions';

export const useCheckPermission = (permission: Permission) =>
  useMyPermissions()?.includes(permission) ?? false;
