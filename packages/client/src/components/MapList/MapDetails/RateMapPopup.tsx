import { MapReviewData } from '@motd-menu/common';
import React, { FC, MouseEventHandler, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSearchParam } from 'react-use';
import { motdApi } from 'src/api';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { Rating } from '~components/common/Rating';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  center: {
    textAlign: 'center',
  },
  rating: {
    justifyContent: 'center',
    width: '100%',
    minWidth: '16em',
  },
  submit: {
    ...outlineButton(),
    textAlign: 'center',
  },
  comment: {
    height: '10em',
  },
});

export const RateMapPopup: FC<{
  mapName: string;
  initialReview?: MapReviewData;
  onSubmit: (rating: MapReviewData, isNew: boolean) => void;
}> = ({ mapName, initialReview, onSubmit }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [comment, setComment] = useState(initialReview?.comment ?? '');

  const [rate, setRate] = useState<number>(initialReview?.rate ?? null);

  const rateOnce = useSearchParam('rateOnce') != null;

  useEffect(() => {
    if (rate != null && rateOnce) {
      motdApi.closeMenu();
    }
  }, [rate, rateOnce]);

  const onSubmitClick: MouseEventHandler = () => {
    if (rate == null) return;

    const review: MapReviewData = {
      rate,
    };

    if (comment) {
      review.comment = comment;
    }

    onSubmit?.(review, !initialReview);
    goBack();
  };

  return (
    <Popup title={'Rate ' + mapName} onClose={goBack}>
      <small className={c.center}>
        Your rating{rate ? `: ${rate}/5` : null}
      </small>
      <Rating rate={rate} setRate={setRate} className={c.rating} />
      <small>Comment (optional)</small>
      <textarea
        className={c.comment}
        value={comment}
        onChange={(e) => setComment(e.currentTarget.value.substring(0, 256))}
      />
      <div
        className={c.submit}
        onClick={onSubmitClick}
        data-disabled={rate == null}
      >
        Submit
      </div>
    </Popup>
  );
};
