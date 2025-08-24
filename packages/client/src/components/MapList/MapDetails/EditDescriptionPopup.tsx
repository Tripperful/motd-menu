import React, { FC, MouseEventHandler, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useGoBack } from 'src/hooks/useGoBack';
import { Popup } from '~components/common/Popup';
import { outlineButton } from '~styles/elements';

const useStyles = createUseStyles({
  center: {
    textAlign: 'center',
  },
  submit: {
    ...outlineButton(),
    textAlign: 'center',
  },
  description: {
    height: '10em',
  },
});

export const EditDescriptionPopup: FC<{
  initialDescription?: string;
  onSubmit: (description: string) => void;
}> = ({ initialDescription, onSubmit }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [description, setDescription] = useState(initialDescription ?? '');

  const onSubmitClick: MouseEventHandler = () => {
    onSubmit?.(description);
    goBack();
  };

  return (
    <Popup title={'Edit map description'} onClose={goBack} poster>
      <small>Description (optional)</small>
      <textarea
        className={c.description}
        value={description}
        onChange={(e) =>
          setDescription(e.currentTarget.value.substring(0, 256))
        }
        autoFocus
      />
      <div className={c.submit} onClick={onSubmitClick}>
        Submit
      </div>
    </Popup>
  );
};
