import { Permission } from '@motd-menu/common';

export interface SessionData {
  steamId: string;
  userId?: number;
  permissions: Permission[];
  volume?: number;
  srcdsVersion?: number;
}
