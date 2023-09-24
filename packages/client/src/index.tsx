import React, { FC } from 'react';
import { createRoot } from 'react-dom/client';
import { Notifications } from '~components/Notifications';
import { withCvars } from './hooks/useCvar';
import { Router } from './router';
import { useGlobalStyles } from './styles/global';

const App: FC = () => {
  useGlobalStyles();

  return (
    <>
      <Router />
      <Notifications />
    </>
  );
};

const EnchancedApp = withCvars(App);

createRoot(document.querySelector('#root')).render(<EnchancedApp />);
