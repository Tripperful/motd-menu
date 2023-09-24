import { Permission } from '@motd-menu/common';

export interface SessionData {
  permissions: Permission[];
  steamId: string;
  name: string;
  userId: number;
}
