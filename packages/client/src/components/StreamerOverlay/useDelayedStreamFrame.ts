import { StreamFrame } from '@motd-menu/common';
import { useEffect, useState } from 'react';
import { motdApi } from 'src/api';

const streamQueue: StreamFrame[] = [];
const streamUpdateRate = 100; // 0.1 seconds
let now = Date.now();

export const useDelayedStreamFrame = (sessionId: string, delay: number) => {
  const [streamFrame, setStreamFrame] = useState<StreamFrame>();

  useEffect(() => {
    streamQueue.length = 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      let nextFrame: StreamFrame;

      (async () => {
        try {
          const lastFrame = await motdApi.getStreamFrame(sessionId);
          now = lastFrame.timestamp;

          if (
            lastFrame.timestamp >
            (streamQueue[streamQueue.length - 1]?.timestamp ?? 0)
          ) {
            streamQueue.push(lastFrame);
          }
        } catch {}
      })();

      while (streamQueue[0]?.timestamp <= now - delay) {
        nextFrame = streamQueue.shift();
      }

      if (nextFrame) {
        setStreamFrame(nextFrame);
      }
    }, streamUpdateRate);

    return () => {
      clearInterval(interval);
    };
  });

  return streamFrame;
};
