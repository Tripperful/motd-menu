import React, { FC, MouseEventHandler, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Route, Routes } from 'react-router';
import { Link } from 'react-router-dom';
import { useGoBack } from 'src/hooks/useGoBack';
import { OrderedList } from '~components/common/OrderedList';
import { Popup } from '~components/common/Popup';
import AddImgIcon from '~icons/add-image.svg';
import { outlineButton } from '~styles/elements';
import { AddImagePopup } from './AddImagePopup';
import { addNotification } from 'src/hooks/state/notifications';

const useStyles = createUseStyles({
  root: {
    width: '25em',
    maxHeight: '25em',
  },
  center: {
    textAlign: 'center',
  },
  submit: {
    ...outlineButton(),
    textAlign: 'center',
  },
  addImgButton: {
    ...outlineButton(),
    alignSelf: 'flex-start',
    fontSize: '0.75em',
    marginLeft: '0.5em',
  },
  listImageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
    padding: '0.5em 0',
    flex: '1 1 auto',
    minWidth: 0,
  },
  listImageImg: {
    borderRadius: '0.5em',
    width: '5em',
    height: '3em',
    objectFit: 'cover',
  },
  listImageSrc: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const ListImage: FC<{
  item: string;
}> = ({ item }) => {
  const c = useStyles();

  return (
    <div className={c.listImageItem}>
      <img src={item} className={c.listImageImg} />
      <span className={c.listImageSrc}>{item}</span>
    </div>
  );
};

export const EditImagesPopup: FC<{
  initialImages?: string[];
  onSubmit: (images: string[]) => void;
}> = ({ initialImages, onSubmit }) => {
  const c = useStyles();
  const goBack = useGoBack();
  const [images, setImages] = useState(initialImages);

  const onSubmitClick: MouseEventHandler = () => {
    onSubmit?.(images);
    goBack();
  };

  const onDeleteImgClick = (img: string, idx: number) => {
    setImages((c) => c.filter((_, i) => i !== idx));
  };

  const onAddImage = (image: string) => {
    setImages((c) => {
      if (c.includes(image)) {
        addNotification('error', 'This image is already added for this map!');
        return c;
      } else {
        return [...c, image];
      }
    });
  };

  return (
    <Popup title={'Edit map images'} onClose={goBack} className={c.root}>
      <small>Images (optional)</small>
      <Link className={c.addImgButton} to="add">
        <AddImgIcon />
        Add image
      </Link>
      <OrderedList
        items={images}
        setItems={(i) => setImages(i)}
        getItemKey={(i) => i}
        ItemComponent={ListImage}
        onDeleteClick={onDeleteImgClick}
      />
      <div className={c.submit} onClick={onSubmitClick}>
        Submit
      </div>
      <Routes>
        <Route path="/add" element={<AddImagePopup onSubmit={onAddImage} />} />
      </Routes>
    </Popup>
  );
};
