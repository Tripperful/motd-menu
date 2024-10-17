import { NewsCommentData } from '@motd-menu/common';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, useNavigate } from 'react-router-dom';
import {
  deleteNewsComment,
  useNewsComments,
} from 'src/hooks/state/newsComments';
import {
  addNewsCommentReaction,
  deleteNewsCommentReaction,
  useNewsCommentReactions,
} from 'src/hooks/state/newsCommentsReactions';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useConfirmDialog } from 'src/hooks/useConfirmDialog';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { dateFormat } from 'src/util';
import {
  ReactionsList,
  ReactionsListSkeleton,
} from '~components/common/ReactionsList';
import { Spinner } from '~components/common/Spinner';
import AddCommentIcon from '~icons/add-comment.svg';
import DeleteIcon from '~icons/delete.svg';
import PencilIcon from '~icons/pencil.svg';
import { activeItemNoTransform, outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { NewsReactions } from './NewsReactions';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  addCommentButton: {
    ...outlineButton(),
    marginLeft: 'auto',
    fontSize: '0.65em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    padding: '0 0.25em',
  },
  reactions: {
    fontSize: '0.65em',
  },
  author: {
    ...activeItemNoTransform(),
    marginRight: 'auto',
  },
  comment: {
    fontSize: '0.8em',
    margin: '0.25em 0',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  date: {
    fontSize: '0.65em',
    color: theme.fg3,
  },
  actionButton: {
    ...outlineButton(),
    fontSize: '0.65em',
  },
});

const NewsCommentAuthor: FC<{ steamId: string }> = ({ steamId }) => {
  const c = useStyles();
  const profile = usePlayerSteamProfile(steamId);

  return (
    <Link to={`author/${steamId}`} className={c.author}>
      <div className={c.author}>{profile?.name ?? steamId}</div>
    </Link>
  );
};

const NewsCommentReactions: FC<{ commentId: string }> = ({ commentId }) => {
  const c = useStyles();
  const reactions = useNewsCommentReactions(commentId);

  return (
    <ReactionsList
      reactions={reactions}
      className={c.reactions}
      onAddReaction={(reaction) => addNewsCommentReaction(commentId, reaction)}
      onRemoveReaction={(reaction) =>
        deleteNewsCommentReaction(commentId, reaction)
      }
    />
  );
};

const NewsComment: FC<{ newsId: string; data: NewsCommentData }> = ({
  newsId,
  data,
}) => {
  const c = useStyles();
  const mySteamId = useMySteamId();
  const isMod = useCheckPermission('comments_edit');
  const nav = useNavigate();

  const canEdit = mySteamId === data.steamId;
  const canDelete = isMod || canEdit;

  const [deleteConfirmDialog, showDeleteConfirmDialog] = useConfirmDialog(
    'Delete this comment?',
    () => {
      deleteNewsComment(newsId, data.id);
    },
  );

  return (
    <div className={c.root}>
      <div className={c.title}>
        <Suspense fallback="Loading...">
          <NewsCommentAuthor steamId={data.steamId} />
        </Suspense>
        <span className={c.date}>{dateFormat(data.createdOn)}</span>
        {canEdit && (
          <Link className={c.actionButton} to={`comment/${data.id}`}>
            <PencilIcon /> Edit
          </Link>
        )}
        {canDelete && (
          <span className={c.actionButton} onClick={showDeleteConfirmDialog}>
            <DeleteIcon /> Delete
          </span>
        )}
      </div>
      <div className={c.comment}>{data.content}</div>
      <Suspense fallback={<ReactionsListSkeleton />}>
        <NewsCommentReactions commentId={data.id} />
      </Suspense>
      {deleteConfirmDialog}
    </div>
  );
};

const NewsCommentsContent: FC<{ newsId: string }> = ({ newsId }) => {
  const c = useStyles();
  const comments = useNewsComments(newsId)?.sort(
    (a, b) => b.createdOn - a.createdOn,
  );
  const hasComments = !!comments?.length;

  return (
    <>
      <NewsReactions newsId={newsId} />
      <h3 className={c.title}>
        {hasComments ? `Comments (${comments.length})` : 'No comments yet'}
        <Link to="comment" className={c.addCommentButton}>
          <AddCommentIcon /> Add comment
        </Link>
      </h3>
      {hasComments && (
        <div className={c.list}>
          {comments.map((comment, i) => (
            <NewsComment key={i} newsId={newsId} data={comment} />
          ))}
        </div>
      )}
    </>
  );
};

export const NewsComments: FC<{ newsId: string }> = ({ newsId }) => {
  const c = useStyles();

  return (
    <div className={c.root}>
      <Suspense fallback={<Spinner />}>
        <NewsCommentsContent newsId={newsId} />
      </Suspense>
    </div>
  );
};
