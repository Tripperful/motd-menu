import classNames from 'classnames';
import React, {
  FC,
  ImgHTMLAttributes,
  Suspense,
  useLayoutEffect,
  useState,
} from 'react';
import { createUseStyles } from 'react-jss';
import { useMapPreview } from 'src/hooks/state/mapPreviews';
import placeholderSrc from '~assets/map.png';

const useStyles = createUseStyles({
  root: {
    objectFit: 'cover',
    objectPosition: 'center',
    opacity: 0,
    transition: 'opacity 0.25s ease-out',
  },
  visible: {
    opacity: 1,
  },
});

type MapImageProps = { mapName: string } & ImgHTMLAttributes<HTMLImageElement>;

type ImgState = 'loading' | 'loaded' | 'error';

const MapPreviewImageContent: FC<MapImageProps> = ({
  mapName,
  className,
  ...attrs
}) => {
  const c = useStyles();
  const preview = useMapPreview(mapName);
  const src =
    preview?.image ??
    `https://image.gametracker.com/images/maps/160x120/hl2dm/${mapName}.jpg`;

  const [state, setState] = useState<ImgState>();

  useLayoutEffect(() => {
    setState(undefined);
  }, [src]);

  useLayoutEffect(() => {
    if (!state) {
      setState('loading');
    }
  }, [state]);

  const cn = classNames(c.root, className, state !== 'loading' && c.visible);

  if (!state) return null;

  const isError = state === 'error';

  return (
    <img
      {...attrs}
      loading="lazy"
      className={cn}
      src={isError ? placeholderSrc : src}
      onError={isError ? undefined : () => setState('error')}
      onLoad={isError ? undefined : () => setState('loaded')}
    />
  );
};

export const MapPreviewImage: FC<MapImageProps> = (props) => (
  <Suspense>
    <MapPreviewImageContent {...props} />
  </Suspense>
);
