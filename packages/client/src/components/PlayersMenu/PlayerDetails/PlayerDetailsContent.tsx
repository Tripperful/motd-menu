import { steamId64ToLegacy, SteamPlayerData } from '@motd-menu/common';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes } from 'react-router-dom';
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
import MatchesIcon from '~icons/playlist.svg';
import SettingsIcon from '~icons/settings.svg';
import ShieldIcon from '~icons/shield.svg';
import StarIcon from '~icons/star.svg';
import UserInspectIcon from '~icons/user-inspect.svg';
import { outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { MapsReviewsPopup } from './MapsReviewsPopup';
import { PlayerAka } from './PlayerAka';
import { PlayerMatchesPopup } from './PlayerMatchesPopup';
import { PlayerPermissionsPopup } from './PlayerPermissions';
import { PlayerSettingsPopup } from './PlayerSettingsPopup';
import { PlayerStats } from './PlayerStats';
import { PlayerTimePlayed } from './PlayerTimePlayed';
import { SetAkaPopup } from './SetAkaPopup';
import { SetPlayerTeam } from './SetPlayerTeam';
import { SmurfsPopup } from './SmurfsPopup';

const useStyles = createUseStyles({
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

const EfpsStatsPopup: FC<{ profile: SteamPlayerData }> = ({ profile }) => {
  const goBack = useGoBack();

  return (
    <IFramePopup
      title={`${profile.name}'s eFPS stats`}
      url={`https://hl2dm.everythingfps.com/profile.php?id=${steamId64ToLegacy(
        profile.steamId,
      )}`}
      onClose={goBack}
    />
  );
};

const PlayerDetailsContent: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();

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
          <PlayerTimePlayed steamId={steamId} />
          {lastGeo && (
            <div>
              Last connected from: <span className={c.value}>{lastGeo}</span>
            </div>
          )}
        </div>
      </div>
      <div className={c.profileButtons}>
        <Link className={c.profileButton} to="smurfs">
          <UserInspectIcon />
          Who is..?
        </Link>
        <Link className={c.profileButton} to="matches">
          <MatchesIcon />
          Matches
        </Link>
        <Link className={c.profileButton} to="settings">
          <SettingsIcon />
          Settings
        </Link>
        <Link className={c.profileButton} to="mapsReviews">
          <StarIcon />
          Maps reviews
        </Link>
        {canViewPermissions && (
          <Link className={c.profileButton} to="permissions">
            <ShieldIcon />
            Permissions
          </Link>
        )}
      </div>
      {canEditTeam && <SetPlayerTeam steamId={steamId} />}
      <PlayerStats steamId={steamId} />
      <Routes>
        <Route path="/smurfs/*" element={<SmurfsPopup profile={player} />} />
        <Route path="/efps/*" element={<EfpsStatsPopup profile={player} />} />
        <Route path="/setAka/*" element={<SetAkaPopup profile={player} />} />
        <Route
          path="/matches/*"
          element={<PlayerMatchesPopup profile={player} />}
        />
        <Route
          path="/mapsReviews/*"
          element={<MapsReviewsPopup profile={player} />}
        />
        <Route
          path="/settings/*"
          element={<PlayerSettingsPopup profile={player} />}
        />
        <Route
          path="/permissions/*"
          element={<PlayerPermissionsPopup profile={player} />}
        />
      </Routes>
    </>
  );
};

export default PlayerDetailsContent;
