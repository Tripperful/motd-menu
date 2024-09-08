import React, { FC, useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useIntersection } from 'react-use';
import LoadingIcon from '~icons/loading.svg';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const PageFetcher: FC<{
  hasMore: boolean;
  loadMore: () => Promise<void>;
}> = ({ hasMore, loadMore }) => {
  const c = useStyles();

  const ref = useRef<HTMLDivElement>(null);
  const fetchRef = useRef<Promise<void>>(null);
  const visible = (useIntersection(ref, {})?.intersectionRatio ?? 0) > 0;

  useEffect(() => {
    if (visible) {
      fetchRef.current ??= loadMore().finally(() => (fetchRef.current = null));
    }
  }, [visible]);

  return hasMore ? (
    <div ref={ref} className={c.root}>
      <LoadingIcon />
    </div>
  ) : null;
};
