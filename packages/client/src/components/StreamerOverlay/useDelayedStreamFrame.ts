import { StreamFrame } from '@motd-menu/common';
import { useEffect, useState } from 'react';

const streamQueue: StreamFrame[] = [];

export const useDelayedStreamFrame = (sessionId: string, delay: number) => {
  const [streamFrame, setStreamFrame] = useState<StreamFrame>();

  useEffect(() => {
    streamQueue.length = 0;
    const eventSource = new EventSource(`/api/stream/${sessionId}`);

    eventSource.onmessage = (event) => {
      const frame = JSON.parse(event.data) as StreamFrame;

      streamQueue.push(frame);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, delay]);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextFrame: StreamFrame;
      let firstFrame: StreamFrame;
      let lastFrame: StreamFrame;

      while (
        (firstFrame = streamQueue[0]) &&
        (lastFrame = streamQueue[streamQueue.length - 1]) &&
        (lastFrame?.timestamp ?? 0) - (firstFrame?.timestamp ?? 0) > delay
      ) {
        nextFrame = streamQueue.shift();
      }

      if (nextFrame) {
        setStreamFrame(nextFrame);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [delay]);

  return streamFrame;
};
