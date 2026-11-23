import type { FC } from 'react';

/** 空会话列表：灰色圆底 + 两个对话气泡 + 难过表情 */
const EmptyChatList: FC = () => {
  return (
    <div className="flex flex-col items-center pt-14">
      <svg width="104" height="96" viewBox="0 0 104 96" fill="none" aria-hidden>
        <circle cx="52" cy="50" r="42" fill="#eef0f4" />
        <path
          d="M40 12l3 7M48 9v8M56 11l-2 7"
          stroke="#9aa0ad"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="52" y="36" width="42" height="34" rx="17" fill="#d5dce6" />
        <circle cx="96" cy="26" r="3" fill="#d5dce6" />
        <circle cx="8" cy="40" r="2" fill="#d5dce6" />
        <rect x="14" y="26" width="52" height="46" rx="23" fill="#fff" />
        <path d="M30 70l-4 14 14-9" fill="#fff" />
        <circle cx="31" cy="46" r="2.4" fill="#5c6170" />
        <circle cx="49" cy="46" r="2.4" fill="#5c6170" />
        <path d="M34 59c3-3 12-3 15 0" stroke="#5c6170" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="mt-4 text-sm text-[#8a90a0]">No chat yet</p>
    </div>
  );
};

export default EmptyChatList;
