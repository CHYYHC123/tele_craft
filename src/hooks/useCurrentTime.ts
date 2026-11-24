import { useEffect, useState } from 'react';

import { formatClockTime } from '@/utils/format';

const MINUTE = 60_000;

/** 本机当前时间（`HH:mm`），在每个整分钟刷新 */
export const useCurrentTime = (): string => {
  const [time, setTime] = useState(() => formatClockTime(new Date()));

  useEffect(() => {
    let timer: number;

    const schedule = () => {
      // 对齐到下一个整分钟，避免漂移
      timer = window.setTimeout(
        () => {
          setTime(formatClockTime(new Date()));
          schedule();
        },
        MINUTE - (Date.now() % MINUTE),
      );
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return time;
};
