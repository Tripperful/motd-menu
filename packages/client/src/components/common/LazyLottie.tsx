import { type LottieComponentProps } from 'lottie-react';
import React, { FC, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import { useRemoteText } from 'src/hooks/state/remoteText';
import { skeletonBg } from '~styles/elements';

const useStyles = createUseStyles({
  '@keyframes bgShift': {
    from: {
      backgroundPositionX: '0vw',
    },
    to: {
      backgroundPositionX: '100vw',
    },
  },
  skeleton: {
    ...skeletonBg(),
    animation: '$bgShift 1s linear infinite',
    width: '100%',
    height: '100%',
    borderRadius: '1000px',
  },
});

export type LazyLottieProps = Omit<LottieComponentProps, 'animationData'> & {
  src: string;
};

const LazyLottieContent: FC<LazyLottieProps> = lazy(async () => {
  const Lottie = (
    await import(/* webpackChunkName: "lottie-react" */ 'lottie-react')
  ).default;

  const LazyLottieContent: FC<LazyLottieProps> = ({ src, ...lottieProps }) => {
    const animationData = useRemoteText(src);

    return <Lottie animationData={animationData} {...lottieProps} />;
  };

  return { default: LazyLottieContent };
});

export const LazyLottie: FC<LazyLottieProps> = (props) => {
  const c = useStyles();

  return (
    <Suspense
      fallback={
        <div className={props.className} style={props.style}>
          <div className={c.skeleton}></div>
        </div>
      }
    >
      <LazyLottieContent {...props} />
    </Suspense>
  );
};
