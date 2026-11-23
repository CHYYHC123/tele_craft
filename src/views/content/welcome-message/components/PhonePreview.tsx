import type { FC, ReactNode } from 'react';

import phoneBg from '@/assets/image/content/wel_bg.png';

interface PhonePreviewProps {
  botName: string;
  /** 放在聊天区底部的内容，如消息气泡 */
  children?: ReactNode;
}

const PhonePreview: FC<PhonePreviewProps> = ({ botName, children }) => {
  return (
    <div className="relative aspect-[560/1024] w-64 shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm">
      <img src={phoneBg} alt="" className="absolute inset-0 size-full" />

      <p className="absolute inset-x-0 top-[7%] text-center text-[11px] font-semibold text-[#191b26]">
        {botName}
      </p>
      {/* <span
        className="absolute top-[6.5%] right-[3.5%] size-[11%] rounded-full bg-[#f3c53f] ring-2 ring-[#1b1b1b]"
        aria-hidden="true"
      /> */}

      <div className="absolute inset-x-[2%] bottom-[16%]">{children}</div>
    </div>
  );
};

export default PhonePreview;
