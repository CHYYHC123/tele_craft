import type { FC } from 'react';

interface StartBarProps {
  label: string;
}

/** 欢迎语预览的底部「开始」按钮（用户尚未开始对话）；底部 Home 横条由 PhonePreview 提供 */
const StartBar: FC<StartBarProps> = ({ label }) => {
  return (
    <div className="select-none relative flex h-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-medium text-slate-900">
      {label}
    </div>
  );
};

export default StartBar;
