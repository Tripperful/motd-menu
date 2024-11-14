import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useOnlinePlayers } from 'src/hooks/state/players';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { Menu } from '~components/common/Menu';
import CancelIcon from '~icons/cancel.svg';
import FlagIcon from '~icons/flag.svg';
import SubstituteIcon from '~icons/substitute.svg';
import { CancelMatch } from './CancelMatch';
import { ForfeitMatch } from './ForfeitMatch';
import { SubstitutePlayer } from './SubstitutePlayer';

const StartVoteMenu: FC = () => {
  const steamId = useMySteamId();
  const players = useOnlinePlayers();
  const myTeamIdx = players.find((p) => p.steamId === steamId)?.teamIdx;
  const isPlaying = myTeamIdx !== 1;

  return (
    <>
      <Routes>
        <Route
          path="/*"
          element={
            <Menu
              items={[
                {
                  title: 'Substitute a player',
                  link: 'substitute',
                  Icon: <SubstituteIcon />,
                },
                {
                  title: 'Cancel this match',
                  link: 'cancelMatch',
                  Icon: <CancelIcon />,
                  shouldShow: () => isPlaying,
                },
                {
                  title: 'Forfeit this match',
                  link: 'forfeitMatch',
                  Icon: <FlagIcon />,
                  shouldShow: () => isPlaying,
                },
              ]}
              title="Select vote type"
            />
          }
        />
        <Route path="substitute" element={<SubstitutePlayer />} />
        <Route path="cancelMatch" element={<CancelMatch />} />
        <Route path="forfeitMatch" element={<ForfeitMatch />} />
      </Routes>
    </>
  );
};

export default StartVoteMenu;
