import { Permission, permissionDescriptions } from './types/permissions';

export * from './cvars';
export * from './types/config';
export * from './types/maps';
export * from './types/permissions';
export * from './types/reviews';
export * from './types/steam';
export * from './types/util';
export * from './types/log';

export const allPermissions = Object.keys(
  permissionDescriptions,
) as Permission[];
