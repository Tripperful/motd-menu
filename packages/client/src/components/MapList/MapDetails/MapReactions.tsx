import { ReactionName } from '@motd-menu/common';
import React, { FC, Suspense } from 'react';
import { motdApi } from 'src/api';
import {
  useAddRemoveMapReaction,
  useMapReactions,
} from 'src/hooks/state/mapReactions';
import { addNotification } from 'src/hooks/state/notifications';
import {
  ReactionsList,
  ReactionsListSkeleton,
} from '~components/common/ReactionsList';

interface MapReactionsProps {
  mapName: string;
}

const MapReactionsContent: FC<MapReactionsProps> = ({ mapName }) => {
  const reactions = useMapReactions(mapName);
  const [addReaction, removeReaction] = useAddRemoveMapReaction(mapName);

  const onAddReaction = async (reaction: ReactionName) => {
    try {
      addReaction(reaction);

      await motdApi.addMapReaction(mapName, reaction);
      addNotification('success', 'Reaction added!');
    } catch {
      addNotification('error', 'Failed to add reaction!');
    }
  };

  const onRemoveReaction = async (reaction: ReactionName) => {
    try {
      removeReaction(reaction);

      await motdApi.deleteMapReaction(mapName, reaction);
      addNotification('success', 'Reaction removed!');
    } catch {
      addNotification('error', 'Failed to remove reaction!');
    }
  };

  return (
    <ReactionsList
      reactions={reactions}
      onAddReaction={onAddReaction}
      onRemoveReaction={onRemoveReaction}
    />
  );
};

export const MapReactions: FC<MapReactionsProps> = (props) => {
  return (
    <Suspense fallback={<ReactionsListSkeleton />}>
      <MapReactionsContent {...props} />
    </Suspense>
  );
};
