import { ReactionData, ReactionName, SteamPlayerData } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useMySteamId } from 'src/hooks/useMySteamId';
import AddReactionIcon from '~icons/add-reaction.svg';
import { activeItem } from '~styles/elements';
import { ClassNameProps } from '~types/props';
import { AddReactionPopup } from './AddReactionPopup';
import { Reaction } from './Reaction';

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

export const ReactionsList: FC<
  {
    reactions: ReactionData[];
    onAddReaction?: (reaction: ReactionName) => void;
    onRemoveReaction?: (reaction: ReactionName) => void;
  } & ClassNameProps
> = ({ reactions, onAddReaction, onRemoveReaction, className }) => {
  const c = useStyles();

  const authorsByReaction = useMemo(() => {
    const authorsByReaction: Partial<Record<ReactionName, SteamPlayerData[]>> =
      {};

    for (const reaction of reactions) {
      const { name, author } = reaction;

      if (!authorsByReaction[name]) {
        authorsByReaction[name] = [];
      }

      authorsByReaction[name].push(author);
    }

    return authorsByReaction;
  }, [reactions]);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const mySteamId = useMySteamId();

  const onReactionClick = (reaction: ReactionName) => {
    setShowAddPopup(false);

    const iReacted = authorsByReaction[reaction]?.some(
      (a) => a.steamId === mySteamId,
    );

    iReacted ? onRemoveReaction?.(reaction) : onAddReaction?.(reaction);
  };

  return (
    <div className={classNames(c.root, className)}>
      {Object.entries(authorsByReaction).map(([name, authors]) => {
        const reactionName = name as ReactionName;
        const iReacted = authors.some((a) => a.steamId === mySteamId);

        return (
          <Reaction
            key={reactionName}
            name={reactionName}
            count={authors.length}
            iReacted={iReacted}
            onClick={() => onReactionClick(reactionName)}
          />
        );
      })}
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
