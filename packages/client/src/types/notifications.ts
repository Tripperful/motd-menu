export type NotificationType = 'info' | 'success' | 'error';

export interface NotificationData {
  id: number;
  expired: boolean;
  type: NotificationType;
  text: string;
}
