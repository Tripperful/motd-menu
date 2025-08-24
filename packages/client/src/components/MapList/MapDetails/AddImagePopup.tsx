import React, { FC, MouseEventHandler, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  submit: {
    ...outlineButton(),
    width: '20em',
    textAlign: 'center',
  },
});

export const AddImagePopup: FC<{
  onSubmit: (image: string) => void;
}> = ({ onSubmit }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [image, setImage] = useState('');

  const onSubmitClick: MouseEventHandler = () => {
    onSubmit?.(image);
    goBack();
  };

  return (
    <Popup title="Add map image" onClose={goBack}>
      <small>Image URL</small>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.currentTarget.value)}
      />
      <div className={c.submit} onClick={onSubmitClick}>
        Submit
      </div>
    </Popup>
  );
};
