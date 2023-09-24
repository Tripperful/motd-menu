import { NotificationData, NotificationType } from '~types/notifications';
import { createGlobalState } from './util';

const notificationsState = createGlobalState([] as NotificationData[]);

export const useNotifications = notificationsState.useExternalState;

const setNotifications = notificationsState.set;

let notifId = 0;

export const addNotification = (
  type: NotificationType,
  text: string,
  duration = 2000,
) => {
  const newNotif: NotificationData = {
    id: notifId++,
    type,
    expired: false,
    text,
  };

  setNotifications(async (cur) => [newNotif, ...(await cur)]);

  setTimeout(() => {
    setNotifications(async (cur) =>
      (await cur).map((n) =>
        n.id === newNotif.id ? { ...n, expired: true } : n,
      ),
    );
  }, duration);

  return newNotif;
};

export const deleteNotification = (id: number) => {
  setNotifications(async (cur) => (await cur).filter((n) => n.id !== id));
};
