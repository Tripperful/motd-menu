import { ReactionData, ReactionName } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, forwardRef, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useMySteamId } from 'src/hooks/useMySteamId';
import AddReactionIcon from '~icons/add-reaction.svg';
import { activeItem } from '~styles/elements';
import { ClassNameProps } from '~types/props';
import { AddReactionPopup } from './AddReactionPopup';
import { Reaction, ReactionSkeleton } from './Reaction';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '0.5em',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addButton: {
    ...activeItem(),
    fontSize: '0.8em',
    display: 'flex',
  },
});

export const ReactionsListSkeleton = forwardRef<HTMLDivElement, ClassNameProps>(
  ({ className }, ref) => {
    const c = useStyles();

    return (
      <div className={classNames(c.root, className)} ref={ref}>
        <ReactionSkeleton />
        <ReactionSkeleton />
        <div className={c.addButton} data-disabled>
          <AddReactionIcon />
        </div>
      </div>
    );
  },
);

export const ReactionsList: FC<
  {
    reactions: ReactionData[];
    onAddReaction?: (reaction: ReactionName) => void;
    onRemoveReaction?: (reaction: ReactionName) => void;
  } & ClassNameProps
> = ({ reactions, onAddReaction, onRemoveReaction, className }) => {
  const c = useStyles();

  const authorsSteamIdsByReaction = useMemo(() => {
    const authorsByReaction: Partial<Record<ReactionName, string[]>> = {};

    for (const reaction of reactions) {
      const { name, steamId } = reaction;

      if (!authorsByReaction[name]) {
        authorsByReaction[name] = [];
      }

      authorsByReaction[name].push(steamId);
    }

    return authorsByReaction;
  }, [reactions]);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const mySteamId = useMySteamId();

  const onReactionClick = (reaction: ReactionName) => {
    setShowAddPopup(false);

    const iReacted = authorsSteamIdsByReaction[reaction].includes(mySteamId);

    iReacted ? onRemoveReaction?.(reaction) : onAddReaction?.(reaction);
  };

  return (
    <div className={classNames(c.root, className)}>
      {Object.entries(authorsSteamIdsByReaction).map(
        ([name, authorsSteamIds]) => {
          const reactionName = name as ReactionName;
          const iReacted = authorsSteamIds.includes(mySteamId);

          return (
            <Reaction
              key={reactionName}
              name={reactionName}
              count={authorsSteamIds.length}
              iReacted={iReacted}
              onClick={() => onReactionClick(reactionName)}
            />
          );
        },
      )}
      <div className={c.addButton} onClick={() => setShowAddPopup(true)}>
        <AddReactionIcon />
      </div>
      {showAddPopup && (
        <AddReactionPopup
          onClose={() => setShowAddPopup(false)}
          onReactionClick={onReactionClick}
        />
      )}
    </div>
  );
};
