import { steamId64ToLegacy } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  useIsPlayerOnline,
  usePlayerSteamProfile,
} from 'src/hooks/state/players';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useGoBack } from 'src/hooks/useGoBack';
import { steamProfileLink } from 'src/util';
import { Flag } from '~components/common/Flag';
import { IFramePopup } from '~components/common/IFramePopup';
import { LineWithCopy } from '~components/common/LineWithCopy';
import { PlayerSettings } from '~components/common/PlayerSettings';
import { SidePanel } from '~components/common/SidePanel';
import MatchesIcon from '~icons/playlist.svg';
import StarIcon from '~icons/star.svg';
import UserInspectIcon from '~icons/user-inspect.svg';
import { outlineButton } from '~styles/elements';
import { MapsReviewsPopup } from './MapsReviewsPopup';
import { PlayerAka } from './PlayerAka';
import { PlayerMatchesPopup } from './PlayerMatchesPopup';
import { PlayerPermissions } from './PlayerPermissions';
import { PlayerStats } from './PlayerStats';
import { PlayerTimePlayed } from './PlayerTimePlayed';
import { SetAkaPopup } from './SetAkaPopup';
import { SetPlayerTeam } from './SetPlayerTeam';
import { SmurfsPopup } from './SmurfsPopup';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    flex: '1 1 auto',
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
    fontSize: '1.2em',
    color: theme.fg1,
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
  value: {
    color: theme.fg1,
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
  const isOnline = useIsPlayerOnline(steamId);
  const profileLink = steamProfileLink(player.steamId);
  const canViewPermissions = useCheckPermission('permissions_view');
  const canEditTeam = useCheckPermission('teams_others_edit') && isOnline;
  const countryCode = player.geo?.countryCode;
  const lastGeo = player.geo?.full;

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
            {countryCode && <Flag code={countryCode} />}
            {player.name}
            <PlayerAka steamId={steamId} />
          </LineWithCopy>
          <LineWithCopy
            copyText={player.steamId}
            what="Player's Steam ID"
            link={{ url: profileLink, copy: true, open: true }}
          >
            Steam ID: <span className={c.value}>{player.steamId}</span>
          </LineWithCopy>
          <div className={c.profileButtons}>
            <Link className={c.profileButton} to="smurfs">
              <UserInspectIcon />
              Who is..?
            </Link>
            <Link className={c.profileButton} to="matches">
              <MatchesIcon />
              Matches
            </Link>
            <Link className={c.profileButton} to="mapsReviews">
              <StarIcon />
              Maps reviews
            </Link>
          </div>
        </div>
      </div>
      <PlayerTimePlayed steamId={steamId} />
      {lastGeo && (
        <div>
          Last connected from: <span className={c.value}>{lastGeo}</span>
        </div>
      )}
      {canEditTeam && <SetPlayerTeam steamId={steamId} />}
      <PlayerStats steamId={steamId} />
      <div className={c.playerInfoList}>
        <div>Client settings</div>
        <PlayerSettings steamId={steamId} />
      </div>
      {canViewPermissions && <PlayerPermissions />}
    </>
  );
};

export const PlayerDetails: FC<{ backPath?: string }> = ({ backPath }) => {
  const c = useStyles();
  const { steamId } = useParams();

  return (
    <SidePanel title={<h2>Player details</h2>} backPath={backPath}>
      <div className={c.root}>
        <PlayerDetailsContent />
      </div>
      <Routes>
        <Route path="/smurfs/*" element={<SmurfsPopup />} />
        <Route path="/efps/*" element={<EfpsStatsPopup />} />
        <Route path="/setAka/*" element={<SetAkaPopup steamId={steamId} />} />
        <Route
          path="/matches/*"
          element={<PlayerMatchesPopup steamId={steamId} />}
        />
        <Route
          path="/mapsReviews/*"
          element={<MapsReviewsPopup steamId={steamId} />}
        />
      </Routes>
    </SidePanel>
  );
};
