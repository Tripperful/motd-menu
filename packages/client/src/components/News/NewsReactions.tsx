import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import {
  addNewsReaction,
  deleteNewsReaction,
  useNewsReactions,
} from 'src/hooks/state/newsReactions';
import { ReactionsList } from '~components/common/ReactionsList';

const useStyles = createUseStyles({
  root: {
    fontSize: '0.8em',
    padding: '0 0.25em',
  },
});

export const NewsReactions: FC<{ newsId: string }> = ({ newsId }) => {
  const c = useStyles();
  const reactions = useNewsReactions(newsId);

  return (
    <ReactionsList
      className={c.root}
      reactions={reactions}
      onAddReaction={(reaction) => addNewsReaction(newsId, reaction)}
      onRemoveReaction={(reaction) => deleteNewsReaction(newsId, reaction)}
    />
  );
};
