import { Cvar } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useCvar } from 'src/hooks/useCvar';
import { Page } from '~components/common/Page';
import { Switch } from '~components/common/Switch';

const useStyles = createUseStyles({
  root: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
  },
  cvarSwitch: {
    display: 'flex',
    gap: '0.5em',
  },
});

const CvarSwitch: FC<{ cvar: Cvar; label: string }> = ({ cvar, label }) => {
  const c = useStyles();
  const [value, setValue, loading] = useCvar(cvar);

  return (
    <div className={c.cvarSwitch}>
      <Switch
        active={value && value == '1'}
        setActive={(active) => setValue(active ? '1' : '0')}
        disabled={loading}
      />
      <div>{label}</div>
    </div>
  );
};

export const MatchSettings: FC = () => {
  const c = useStyles();

  return (
    <Page title="Match settings">
      <div className={c.root}>
        <CvarSwitch cvar="mp_teamplay" label="Team play" />
        <CvarSwitch cvar="mp_timelimit" label="Time limit" />
        <CvarSwitch cvar="sv_cheats" label="Cheats" />
      </div>
    </Page>
  );
};
