import { steamId64ToLegacy } from '@motd-menu/common';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  getOnlinePlayers,
  usePlayerSteamProfile,
} from 'src/hooks/state/players';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useGoBack } from 'src/hooks/useGoBack';
import { steamProfileLink } from 'src/util';
import { MapDetails } from '~components/MapList/MapDetails';
import { IFramePopup } from '~components/common/IFramePopup';
import { LineWithCopy } from '~components/common/LineWithCopy';
import { SidePanel } from '~components/common/SidePanel';
import CombineIcon from '~icons/combine.svg';
import EfpsIcon from '~icons/efps.svg';
import SpecIcon from '~icons/eye.svg';
import RebelIcon from '~icons/lambda.svg';
import UserInspectIcon from '~icons/user-inspect.svg';
import { outlineButton } from '~styles/elements';
import { PlayerPermissions } from './PlayerPermissions';
import { PlayerReviews } from './PlayerReviews';
import { PlayerTimePlayed } from './PlayerTimePlayed';
import { SmurfsPopup } from './SmurfsPopup';

const useStyles = createUseStyles({
  root: {
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    overflow: 'hidden scroll',
  },
  playerInfo: {
    display: 'flex',
    gap: '1em',
  },
  playerInfoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  avatar: {
    width: '6.5em',
    height: '6.5em',
    borderRadius: '0.5em',
  },
  playerName: {
    fontSize: '1.5em',
  },
  steamId: {
    fontSize: '1em',
  },
  profileButtons: {
    display: 'flex',
    gap: '0.5em',
    whiteSpace: 'nowrap',
    flexWrap: 'wrap',
  },
  profileButton: {
    ...outlineButton(),
  },
});

const EfpsStatsPopup: FC = () => {
  const { steamId } = useParams();
  const goBack = useGoBack();

  return (
    <IFramePopup
      title="eFPS stats"
      url={`https://hl2dm.everythingfps.com/profile.php?id=${steamId64ToLegacy(
        steamId,
      )}`}
      onClose={goBack}
    />
  );
};

const PlayerDetailsContent: FC = () => {
  const c = useStyles();

  const { steamId } = useParams();
  const player = usePlayerSteamProfile(steamId);
  const profileLink = steamProfileLink(player.steamId);
  const canViewPermissions = useCheckPermission('permissions_view');
  const canEditTeam = useCheckPermission('teams_others_edit');

  const setTeam = async (teamIndex: 1 | 2 | 3) => {
    const player = (await getOnlinePlayers())?.find(
      (p) => p.steamId === steamId,
    );

    if (!player) {
      addNotification('error', 'Player is offline!');
      return;
    }

    await motdApi.setTeam(teamIndex, player.userId);
  };

  return (
    <>
      <div className={c.playerInfo}>
        <img className={c.avatar} src={player.avatar} />
        <div className={c.playerInfoList}>
          <LineWithCopy
            className={c.playerName}
            copyText={player.name}
            what="Player's name"
          >
            Name: {player.name}
          </LineWithCopy>
          <LineWithCopy
            className={c.steamId}
            copyText={player.steamId}
            what="Player's Steam ID"
            link={{ url: profileLink, copy: true, open: true }}
          >
            Steam ID: {player.steamId}
          </LineWithCopy>
          <div className={c.profileButtons}>
            <Link className={c.profileButton} to="smurfs">
              <UserInspectIcon />
              Who is..?
            </Link>
            <Link className={c.profileButton} to="efps">
              <EfpsIcon />
              eFPS stats
            </Link>
          </div>
        </div>
      </div>
      <PlayerTimePlayed steamId={steamId} />
      {canEditTeam && (
        <>
          <div>Change player team</div>
          <div className={c.profileButtons}>
            <div className={c.profileButton} onClick={() => setTeam(1)}>
              <SpecIcon />
              Spectator
            </div>
            <div className={c.profileButton} onClick={() => setTeam(2)}>
              <CombineIcon />
              Combine
            </div>
            <div className={c.profileButton} onClick={() => setTeam(3)}>
              <RebelIcon />
              Rebel
            </div>
          </div>
        </>
      )}
      {canViewPermissions && <PlayerPermissions />}
      <PlayerReviews steamId={steamId} />
    </>
  );
};

const RatedMapDetails: FC = () => {
  const { mapName } = useParams();

  return <MapDetails mapName={mapName} />;
};

export const PlayerDetails: FC = () => {
  const c = useStyles();

  return (
    <SidePanel title="Player details">
      <div className={c.root}>
        <Suspense fallback="Loading...">
          <PlayerDetailsContent />
        </Suspense>
      </div>
      <Routes>
        <Route path="/smurfs/*" element={<SmurfsPopup />} />
        <Route path="/efps/*" element={<EfpsStatsPopup />} />
        <Route path="/:mapName/*" element={<RatedMapDetails />} />
      </Routes>
    </SidePanel>
  );
};
