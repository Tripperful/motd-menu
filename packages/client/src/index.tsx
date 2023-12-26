import React, { FC } from 'react';
import { createRoot } from 'react-dom/client';
import { Notifications } from '~components/Notifications';
import { withCvars } from './hooks/useCvar';
import { Router } from './router';
import { useGlobalStyles } from './styles/global';
import { SnowOverlay } from '~components/SnowOverlay/SnowOverlay';

const App: FC = () => {
  useGlobalStyles();

  return (
    <>
      <Router />
      <Notifications />
      <SnowOverlay />
    </>
  );
};

const EnchancedApp = withCvars(App);

createRoot(document.querySelector('#root')).render(<EnchancedApp />);
