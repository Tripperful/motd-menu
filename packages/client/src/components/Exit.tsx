import { FC } from 'react';
import { useMount } from 'react-use';
import { motdApi } from 'src/api';

export const Exit: FC = () => {
  useMount(() => {
    motdApi.closeMenu();
  });

  return null;
};
