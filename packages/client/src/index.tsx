import React, { FC } from 'react';
import { createRoot } from 'react-dom/client';
import { Tooltip } from 'react-tooltip';
import { Notifications } from '~components/Notifications';
import { SnowOverlay } from '~components/SnowOverlay/SnowOverlay';
import { motdApi } from './api';
import { withCvars } from './hooks/useCvar';
import { Router } from './router';
import { useGlobalStyles } from './styles/global';
import { getCookies } from './util';
import { createPortal } from 'react-dom';

window.addEventListener('error', (e) => {
  const cookies = getCookies();

  const sendLogsCookie = cookies.sendLogs;
  const sendLogs =
    (sendLogsCookie && (JSON.parse(sendLogsCookie) as boolean)) || false;

  if (!sendLogs) return;

  motdApi.sendLog('error', JSON.stringify(e.error?.message ?? e.error));
});

const App: FC = () => {
  useGlobalStyles();

  return (
    <>
      <Router />

      <Notifications />
      <SnowOverlay />
      {createPortal(
        <Tooltip id="tooltip" />,
        document.getElementById('modalRoot'),
      )}
    </>
  );
};

const EnchancedApp = withCvars(App);

createRoot(document.querySelector('#root')).render(<EnchancedApp />);
