import classNames from 'classnames';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  getOnlinePlayers,
  usePlayerSteamProfile,
} from 'src/hooks/state/players';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { steamProfileLink } from 'src/util';
import { MapDetails } from '~components/MapList/MapDetails';
import { CopyOnClick } from '~components/common/CopyOnClick';
import { SidePanel } from '~components/common/SidePanel';
import CopyIcon from '~icons/copy.svg';
import OpenIcon from '~icons/open-in-browser.svg';
import SpecIcon from '~icons/eye.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { ChildrenProps, ClassNameProps } from '~types/props';
import { PlayerPermissions } from './PlayerPermissions';
import { PlayerReviews } from './PlayerReviews';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';

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
    width: '6em',
    height: '6em',
    borderRadius: '0.5em',
  },
  lineWithCopy: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  copyButton: {
    display: 'inline-flex',
    fontSize: '0.5em',
    ...activeItem(),
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
  },
  profileButton: {
    ...outlineButton(),
  },
});

const LineWithCopy: FC<
  { copyText: string; what?: string } & ChildrenProps & ClassNameProps
> = ({ copyText, what, children, className }) => {
  const c = useStyles();

  return (
    <div className={classNames(c.lineWithCopy, className)}>
      {children}
      <CopyOnClick copyText={copyText} what={what}>
        <div className={c.copyButton}>
          <CopyIcon />
        </div>
      </CopyOnClick>
    </div>
  );
};

const PlayerDetailsContent: FC = () => {
  const c = useStyles();

  const { steamId } = useParams();
  const player = usePlayerSteamProfile(steamId);
  const profileLink = steamProfileLink(player.steamId);
  const canViewPermissions = useCheckPermission('permissions_view');
  const isDev = useCheckPermission('dev');

  const onMoveToSpecClick = async () => {
    const player = (await getOnlinePlayers())?.find(
      (p) => p.steamId === steamId,
    );

    if (!player) {
      addNotification('error', 'Player is offline!');
      return;
    }

    await motdApi.setTeam(1, player.userId);
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
            {player.name}
          </LineWithCopy>
          <LineWithCopy
            className={c.steamId}
            copyText={player.steamId}
            what="Player's Steam ID"
          >
            Steam ID: {player.steamId}
          </LineWithCopy>
          <div className={c.profileButtons}>
            <CopyOnClick copyText={profileLink} what="Player's profile link">
              <div className={c.profileButton}>
                <CopyIcon />
                Copy profile link
              </div>
            </CopyOnClick>
            <Link className={c.profileButton} to={profileLink}>
              <OpenIcon />
              View profile
            </Link>
          </div>
        </div>
      </div>
      {isDev && (
        <div>
          <div className={c.profileButton} onClick={onMoveToSpecClick}>
            <SpecIcon />
            Move to spectators
          </div>
        </div>
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
        <Route path="/:mapName/*" element={<RatedMapDetails />} />
      </Routes>
    </SidePanel>
  );
};
