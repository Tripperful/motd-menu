import { MapReviewData } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { motdApi } from 'src/api';
import { setMapReviews } from 'src/hooks/state/mapReviews';
import { addNotification } from 'src/hooks/state/notifications';
import { useCheckPermission } from 'src/hooks/useCheckPermission';
import { useConfirmDialog } from 'src/hooks/useConfirmDialog';
import { useMySteamId } from 'src/hooks/useMySteamId';
import { dateFormat, steamProfileLink } from 'src/util';
import { CopyOnClick } from '~components/common/CopyOnClick';
import { MapPreviewImage } from '~components/common/MapPreviewImage';
import { Rating } from '~components/common/Rating';
import CrossIcon from '~icons/close.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
  },
  content: {
    flex: '1 1 100%',
  },
  avatar: {
    display: 'inline-block',
    width: '3em',
    height: '3em',
    marginRight: '0.5em',
    borderRadius: '0.5em',
    float: 'left',
    flex: '0 0 auto',
  },
  wide: {
    width: '5em',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  author: {
    ...activeItem(),
  },
  rating: {
    fontSize: '0.5em',
  },
  tail: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  deleteButton: {
    ...activeItem(),
    fontSize: '0.5em',
  },
  comment: {
    display: 'block',
    marginTop: '0.2em',
    wordBreak: 'break-word',
  },
  confirmPopupContent: {
    display: 'flex',
    gap: '1em',
  },
  actionButton: {
    ...outlineButton(),
    flex: '1 1 100%',
  },
  date: {
    fontSize: '0.8em',
    color: theme.fg3,
  },
});

export const MapReview: FC<{
  review: MapReviewData;
  mapDetailsMode?: boolean;
}> = ({ review, mapDetailsMode }) => {
  const c = useStyles();

  const { mapName, rate, author, comment } = review;

  const canEditReviews = useCheckPermission('comments_edit');
  const steamId = useMySteamId();

  const canDelete = steamId === review.steamId || canEditReviews;

  const onDeleteConfirm = async () => {
    try {
      await motdApi.deleteMapReview(mapName, steamId);

      setMapReviews(mapName, async (cur) =>
        (await cur).filter((r) => r.steamId !== steamId),
      );

      addNotification('success', 'Review deleted!');
    } catch {
      addNotification('error', 'Failed to delete the review!');
    }
  };

  const [deleteConfirmDialog, showDeleteDialog] = useConfirmDialog(
    'Delete this review?',
    onDeleteConfirm,
  );

  return (
    <div className={c.root}>
      {mapDetailsMode ? (
        <MapPreviewImage
          className={classNames(c.avatar, c.wide)}
          mapName={mapName}
        />
      ) : (
        <img className={c.avatar} src={author.avatar} />
      )}
      <div className={c.content}>
        <div className={c.title}>
          {mapDetailsMode ? (
            <Link to={mapName} className={c.author}>
              {mapName}
            </Link>
          ) : (
            <CopyOnClick
              copyText={steamProfileLink(author.steamId)}
              what={author.name + "'s profile link"}
            >
              <div className={c.author}>{author.name}</div>
            </CopyOnClick>
          )}

          <span>-</span>
          <Rating className={c.rating} rate={rate} />
          <div className={c.tail}>
            <div className={c.date}>{dateFormat(review.timestamp)}</div>
            {canDelete && (
              <div className={c.deleteButton} onClick={showDeleteDialog}>
                <CrossIcon />
              </div>
            )}
          </div>
        </div>
        {comment && <small className={c.comment}>{comment}</small>}
      </div>
      {deleteConfirmDialog}
    </div>
  );
};
