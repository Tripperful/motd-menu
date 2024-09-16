import { StreamFrame } from '@motd-menu/common';
import { useEffect, useState } from 'react';

const streamQueue: StreamFrame[] = [];
let now = Date.now();

export const useDelayedStreamFrame = (sessionId: string, delay: number) => {
  const [streamFrame, setStreamFrame] = useState<StreamFrame>();

  useEffect(() => {
    streamQueue.length = 0;
    const eventSource = new EventSource(`/api/stream/${sessionId}`);

    eventSource.onmessage = (event) => {
      const frame = JSON.parse(event.data) as StreamFrame;

      if (frame.timestamp > now - delay) {
        streamQueue.push(frame);

        now = frame.timestamp;
      }
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, delay]);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextFrame: StreamFrame;

      while (streamQueue[0]?.timestamp <= now - delay) {
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
