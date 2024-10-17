import React, { FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import {
  addNewsComment,
  editNewsComment,
  useNewsComments,
} from 'src/hooks/state/newsComments';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  comment: {
    height: '10em',
    width: '20em',
    fontSize: '0.8em',
  },
  submit: {
    ...outlineButton(),
    textAlign: 'center',
  },
});

const useCommentContent = (newsId: string, commentId: string) => {
  const comments = useNewsComments(newsId);

  return comments?.find((c) => c.id === commentId)?.content ?? '';
};

export const NewsCommentPopup: FC = () => {
  const c = useStyles();
  const { newsId, commentId } = useParams();
  const [content, setContent] = useState(useCommentContent(newsId, commentId));

  const goBackRaw = useGoBack();
  const goBack = () => goBackRaw(commentId ? 2 : 1);

  const onSubmit = async () => {
    if (commentId) {
      await editNewsComment(newsId, commentId, content);
    } else {
      await addNewsComment(newsId, content);
    }
    goBack();
  };

  return (
    <Popup onClose={goBack} title={`${commentId ? 'Edit' : 'Add'} comment`}>
      <textarea
        className={c.comment}
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
        autoFocus
      />
      <div className={c.submit} onClick={onSubmit}>
        Submit
      </div>
    </Popup>
  );
};
