import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import classNames from 'classnames';
import React, { ComponentProps, FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { useMatchState } from 'src/hooks/state/match';
import { useOnlinePlayers } from 'src/hooks/state/players';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { usePlayersProfiles } from 'src/hooks/usePlayersProfiles';
import { steamProfileLink } from 'src/util';
import { teamInfoByIdx } from 'src/util/teams';
import { ConfirmDialog } from '~components/common/ConfirmDialog';
import { CopyOnClick } from '~components/common/CopyOnClick';
import { Page } from '~components/common/Page';
import { PlayerItem } from '~components/common/PlayerItem';
import { activeItemNoTransform } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  '@keyframes slide-in': {
    '0%': {
      transform: 'translateX(0)',
    },
    '80%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(0)',
    },
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    padding: '1em',
    alignItems: 'center',
    overflow: 'hidden auto',
  },
  title: {
    textAlign: 'center',
  },
  columns: {
    minHeight: 0,
    display: 'flex',
    gap: '1em',
  },
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5em',
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    width: '20em',
  },
  teamList: {
    display: 'flex',
    gap: '1em',
  },
  copy: {
    ...activeItemNoTransform(),
  },
});

const useDraggableStyles = createUseStyles({
  '@keyframes slide-in': {
    '0%': {
      transform: 'translateX(0)',
    },
    '80%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(0)',
    },
  },
  draggable: {
    cursor: 'move',
    '&:nth-child(2)': {
      animation: (skipTutorial: boolean) =>
        skipTutorial ? undefined : '$slide-in 2s ease 2s',
    },
  },
});

interface ReplacementData {
  whom: string;
  withWhom: string;
}

const DraggablePlayerItem: FC<ComponentProps<typeof PlayerItem>> = (props) => {
  const c = useDraggableStyles(
    !!localStorage.getItem('substituteTutorialPassed'),
  );

  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id: props.profile.steamId,
    data: {
      draggableSteamId: props.profile.steamId,
    },
  });

  const { className, ...restProps } = props;

  return (
    <PlayerItem
      className={classNames(c.draggable, className)}
      {...restProps}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={{
        ...props.style,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scaleX}, ${transform.scaleY})`
          : undefined,
      }}
    />
  );
};

const DroppablePlayerItem: FC<ComponentProps<typeof PlayerItem>> = (props) => {
  const { setNodeRef } = useDroppable({
    id: props.profile.steamId,
    data: {
      droppableSteamId: props.profile.steamId,
    },
  });

  return <PlayerItem {...props} ref={setNodeRef} />;
};

const SubstitutePlayerContent: FC = () => {
  const c = useStyles();
  const players = useOnlinePlayers();
  const matchState = useMatchState();
  const mySteamId = useMySteamId();
  const [replacement, setReplacement] = useState<ReplacementData>();

  const participantsSteamIds = useMemo(
    () => matchState?.participants ?? [],
    [matchState?.participants, replacement],
  );

  const viewersSteamIds = useMemo(
    () =>
      players
        .filter((player) => !participantsSteamIds.includes(player.steamId))
        .map((player) => player.steamId),
    [players, participantsSteamIds],
  );

  const steamIds = useMemo(
    () => [...participantsSteamIds, ...viewersSteamIds],
    [participantsSteamIds, viewersSteamIds],
  );
  const profiles = usePlayersProfiles(steamIds);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const draggableSteamId = active.data.current.draggableSteamId;
    const droppableSteamId = over.data.current.droppableSteamId;

    if (draggableSteamId && droppableSteamId) {
      localStorage.setItem('substituteTutorialPassed', 'true');
      setReplacement({
        whom: droppableSteamId,
        withWhom: draggableSteamId,
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={c.root}>
        <div className={c.columns}>
          <div className={c.teamList}>
            <div className={c.playerList}>
              <div className={c.title}>Participants</div>
              {participantsSteamIds.map((steamId) => {
                if (steamId === replacement?.whom) {
                  steamId = replacement.withWhom;
                }
                if (!profiles[steamId]) {
                  debugger;
                }
                const player = players.find((p) => p.steamId === steamId);
                const teamColor = player
                  ? teamInfoByIdx[player.teamIdx].color
                  : theme.fg3;

                return (
                  <DroppablePlayerItem
                    key={steamId}
                    profile={profiles[steamId]}
                    style={{ color: teamColor }}
                  />
                );
              })}
            </div>
            <div className={c.playerList}>
              <div className={c.title}>Viewers</div>
              {viewersSteamIds
                .filter((steamId) => steamId !== replacement?.withWhom)
                .map((steamId) => (
                  <DraggablePlayerItem
                    key={steamId}
                    profile={profiles[steamId]}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
      {replacement && (
        <ConfirmDialog
          title="Replace player?"
          onCancel={() => {
            setReplacement(undefined);
          }}
          onConfirm={() => {
            if (replacement.withWhom === mySteamId) {
              motdApi.confirmReplacePlayer(replacement.whom);
            } else {
              motdApi.replaceMatchPlayer(
                replacement.whom,
                replacement.withWhom,
              );
            }
            motdApi.closeMenu();
          }}
        >
          Do you want to replace{' '}
          {replacement.whom === mySteamId ? (
            'yourself'
          ) : (
            <CopyOnClick
              className={c.copy}
              copyText={steamProfileLink(replacement.whom)}
              what="Profile link"
            >
              {profiles[replacement.whom]?.name}
            </CopyOnClick>
          )}{' '}
          {replacement.withWhom !== mySteamId && (
            <>
              {'with '}
              <CopyOnClick
                className={c.copy}
                copyText={steamProfileLink(replacement.withWhom)}
                what="Profile link"
              >
                {profiles[replacement.withWhom]?.name}
              </CopyOnClick>{' '}
            </>
          )}
          in this match?
        </ConfirmDialog>
      )}
    </DndContext>
  );
};

export const SubstitutePlayer: FC = () => {
  return (
    <Page title={<h2>Substitute a player</h2>}>
      <SubstitutePlayerContent />
    </Page>
  );
};
