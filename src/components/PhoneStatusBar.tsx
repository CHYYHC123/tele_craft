import type { FC } from 'react';

import batteryIcon from '@/assets/image/content/battery.svg';
import signalIcon from '@/assets/image/content/signal.svg';
import wifiIcon from '@/assets/image/content/wifi.svg';
import { useCurrentTime } from '@/hooks/useCurrentTime';

/** 手机状态栏：本机时间 + 信号 / Wi‑Fi / 电量图标（中间留给灵动岛） */
const PhoneStatusBar: FC = () => {
  const time = useCurrentTime();

  return (
    <div className="flex h-11 shrink-0 items-center justify-between bg-white px-7 select-none">
      <span className="text-[11px] font-semibold text-slate-900 tabular-nums">{time}</span>
      <div className="flex items-center gap-1" aria-hidden="true">
        <img src={signalIcon} alt="" className="h-2.5" />
        <img src={wifiIcon} alt="" className="h-2.5" />
        <img src={batteryIcon} alt="" className="h-2.5" />
      </div>
    </div>
  );
};

export default PhoneStatusBar;
