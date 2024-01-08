import { ReactionName, reactionsAnimDataSrc } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { activeItem, skeletonBg } from '~styles/elements';
import { theme } from '~styles/theme';
import { LazyLottie, LazyLottieProps } from './LazyLottie';

const useStyles = createUseStyles({
  '@keyframes bgShift': {
    from: {
      backgroundPositionX: '0vw',
    },
    to: {
      backgroundPositionX: '100vw',
    },
  },
  root: {
    ...activeItem(),
    position: 'relative',
    display: 'flex',
    gap: '0.2em',
    alignItems: 'center',
    background: theme.bg2,
    borderRadius: '1.2em',
    padding: '0.2em',
    transition: 'background-color 0.5s ease-in',
  },
  lottie: {
    width: '2em',
    height: '2em',
    zIndex: 1,
  },
  count: {
    fontSize: '1em',
    textShadow: `${theme.bg1} 0 0 2px`,
    marginRight: '0.2em',
  },
  reacted: {
    background: theme.bgInfo,
    filter: `drop-shadow(0 0 3px ${theme.fg1})`,
  },
  skeleton: {
    ...skeletonBg(),
    animation: '$bgShift 1s linear infinite',
  },
});

export const ReactionIcon: FC<
  { name: ReactionName } & Omit<LazyLottieProps, 'name' | 'src'>
> = ({ name, className, ...props }) => {
  const c = useStyles();

  return (
    <LazyLottie
      className={classNames(c.lottie, className)}
      src={reactionsAnimDataSrc[name]}
      {...props}
    />
  );
};

export const ReactionSkeleton: FC = () => {
  const c = useStyles();

  return (
    <div className={classNames(c.root, c.skeleton)}>
      <div className={c.lottie}></div>
    </div>
  );
};

export const Reaction: FC<{
  name: ReactionName;
  count?: number;
  iReacted?: boolean;
  onClick?: () => void;
}> = ({ name, count = 1, iReacted, onClick }) => {
  const c = useStyles();

  return (
    count && (
      <div
        className={classNames(c.root, iReacted && c.reacted)}
        onClick={onClick}
      >
        <ReactionIcon name={name} />
        {count > 1 && <div className={c.count}>{count}</div>}
      </div>
    )
  );
};
