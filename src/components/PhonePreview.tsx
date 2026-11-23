import type { FC, ReactNode } from 'react';

interface PhonePreviewProps {
  /** 手机外框 + 聊天背景图 */
  background: string;
  botName: string;
  /** 聊天内容区底部距离（占整体高度的百分比），因背景图底部栏高度不同而异 */
  contentBottom?: number;
  /** 放在聊天区底部的内容，如消息气泡 */
  children?: ReactNode;
}

const PhonePreview: FC<PhonePreviewProps> = ({
  background,
  botName,
  contentBottom = 14,
  children,
}) => {
  return (
    <div className="relative aspect-[560/1024] w-64 shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm">
      <img src={background} alt="" className="absolute inset-0 size-full" />

      <p className="absolute inset-x-0 top-[7%] text-center text-[11px] font-semibold text-[#191b26]">
        {botName}
      </p>
      <span
        className="absolute top-[6.5%] right-[3.5%] size-[11%] rounded-full bg-[#f3c53f] ring-2 ring-[#1b1b1b]"
        aria-hidden="true"
      />

      <div className="absolute inset-x-[2%]" style={{ bottom: `${contentBottom}%` }}>
        {children}
      </div>
    </div>
  );
};

export default PhonePreview;
