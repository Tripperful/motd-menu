import { Cvar, matchCvars } from '@motd-menu/common';
import React, { FC, useCallback, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import { CvarControl } from '~components/common/CvarControl';
import { SidePanel } from '~components/common/SidePanel';
import PlayIcon from '~icons/play.svg';
import { outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { StartMatchSettingsContext } from './StartMatchMenu';

const useStyles = createUseStyles({
  root: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    minHeight: 0,
  },
  cvarList: {
    padding: '1em',
    flex: '1 1 auto',
    overflow: 'hidden auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  footer: {
    background: theme.bg1,
    padding: '0.5em',
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionButton: {
    ...outlineButton(),
  },
});

const useStartMatchCvar = (cvar: Cvar) => {
  const { cvars, setCvarValue } = useContext(StartMatchSettingsContext);

  const set = useCallback(
    (value: string) => setCvarValue(cvar, value),
    [cvar, setCvarValue],
  );

  return [cvars[cvar], set] as const;
};

const MatchCvarControl: FC<{ cvar: Cvar }> = ({ cvar }) => {
  const [value, setValue] = useStartMatchCvar(cvar);

  return (
    <CvarControl key={cvar} cvar={cvar} value={value} setValue={setValue} />
  );
};

export const MatchSettings: FC = () => {
  const c = useStyles();
  const { cvars, players } = useContext(StartMatchSettingsContext);

  const onStartMatchClick = useCallback(async () => {
    try {
      await motdApi.startMatch({ cvars, players });
      await motdApi.closeMenu();
    } catch (e) {
      addNotification(
        'error',
        typeof e === 'string' ? e : 'Failed to start a match',
      );
    }
  }, [cvars, players]);

  return (
    <SidePanel title={<h2>Match settings</h2>}>
      <div className={c.root}>
        <div className={c.cvarList}>
          {matchCvars.map((cvar) => (
            <MatchCvarControl key={cvar} cvar={cvar} />
          ))}
        </div>
        <div className={c.footer}>
          <div className={c.actionButton} onClick={onStartMatchClick}>
            Start match
            <PlayIcon />
          </div>
        </div>
      </div>
    </SidePanel>
  );
};
