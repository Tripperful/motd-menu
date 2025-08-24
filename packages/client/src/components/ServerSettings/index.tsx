import {
  cvarsInfo,
  getEditableCvars,
  getViewableCvars,
} from '@motd-menu/common';
import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { useMyPermissions } from 'src/hooks/state/permissions';
import { useGoBack } from 'src/hooks/useGoBack';
import { ServerCvarControl } from '~components/common/CvarControl';
import { Page } from '~components/common/Page';
import { Popup } from '~components/common/Popup';
import TerminalIcon from '~icons/terminal.svg';
import { activeItem, outlineButton, verticalScroll } from '~styles/elements';

const useStyles = createUseStyles({
  root: {
    ...verticalScroll(),
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  button: {
    ...activeItem(),
    display: 'flex',
    '&:last-child': {
      marginRight: '0.5em',
    },
  },
  submit: {
    ...outlineButton(),
    textAlign: 'center',
    minWidth: '20em',
  },
});

const RunCommandPopup: FC = () => {
  const c = useStyles();
  const goBack = useGoBack();
  const [command, setCommand] = useState('');

  const onSubmit = async () => {
    try {
      await motdApi.runCommand(command);

      goBack();
      addNotification('success', 'Command executed');
    } catch {
      addNotification('error', 'Failed to execute command');
    }
  };

  return (
    <Popup onClose={goBack} title="Run command">
      <small>Execute command in the server console</small>
      <input
        type="text"
        value={command}
        placeholder="sv_cheats 1; changelevel dm_lockdown"
        onChange={(e) => setCommand(e.currentTarget.value)}
      />
      <div onClick={onSubmit} className={c.submit}>
        Submit
      </div>
    </Popup>
  );
};

export const ServerSettings: FC = () => {
  const c = useStyles();
  const permissions = useMyPermissions();

  const viewableCvars = getViewableCvars(permissions).filter(
    (cvar) => cvarsInfo[cvar].description != null,
  );
  const editableCvars = getEditableCvars(permissions);
  const canRunCommands = permissions.includes('rcon');

  return (
    <Page
      title={
        <>
          <h2>Server settings</h2>
          {canRunCommands && (
            <Link to="runCommand" className={c.button}>
              <TerminalIcon />
            </Link>
          )}
        </>
      }
    >
      <div className={c.root}>
        {viewableCvars?.map((cvar) => (
          <ServerCvarControl
            key={cvar}
            cvar={cvar}
            disabled={!editableCvars.includes(cvar)}
          />
        ))}
      </div>
      <Routes>
        <Route path="runCommand/*" element={<RunCommandPopup />} />
      </Routes>
    </Page>
  );
};

export default ServerSettings;
