import classNames from 'classnames';
import React, { FC, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { useGlobalStyles } from '~styles/global';
import { PlayerOverlayItem } from './PlayerOverlayItem';
import { useDelayedStreamFrame } from './useDelayedStreamFrame';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  team: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5em',
    alignItems: 'end',
    '&:first-child': {
      alignItems: 'start',
    },
  },
  center: {
    alignItems: 'center',
    height: '100%',
  },
});

export const StreamerOverlay: FC = () => {
  useGlobalStyles();
  const c = useStyles();

  const { sessionId, scale, delay, center } = useMemo(() => {
    const params = new URLSearchParams(location.search);

    const sessionId = params.get('guid');
    const scaleStr = params.get('scale') ?? '1';
    const delayStr = params.get('delay') ?? '0';
    const center = params.get('center') === '1';

    return {
      sessionId,
      scale: Number(scaleStr),
      delay: Number(delayStr),
      center,
    };
  }, [location.search]);

  const frame = useDelayedStreamFrame(sessionId, delay * 1000);

  const teams = useMemo(() => {
    if (!frame) return [];

    const players = frame.players.filter((player) => player.teamIdx !== 1);

    const uniqueTeamIdxs = new Set(players.map((player) => player.teamIdx));

    if (uniqueTeamIdxs.size < 2) {
      return [
        players.filter((_, idx) => idx % 2 === 0),
        players.filter((_, idx) => idx % 2 === 1),
      ];
    }

    return Array.from(uniqueTeamIdxs).map((teamIdx) =>
      players.filter((player) => player.teamIdx === teamIdx),
    );
  }, [frame]);

  return (
    <div
      className={classNames(c.root, center && c.center)}
      style={{ fontSize: scale + 'em' }}
    >
      {teams.map((team, idx) => (
        <div key={idx} className={c.team}>
          {team.map((player) => (
            <PlayerOverlayItem
              steamId={player.steamId}
              key={player.steamId}
              teamIdx={player.teamIdx}
              kills={player.kills}
              deaths={player.deaths}
              hp={player.health}
              ap={player.armor}
              sprint={player.stamina}
              flashlight={player.flashlight}
              weapon={player.weapon}
              flip={idx % 2 === 0}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default StreamerOverlay;
