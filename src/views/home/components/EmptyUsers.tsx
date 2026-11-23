import type { FC } from 'react';

import Button from '@/components/Button';

interface EmptyUsersProps {
  onStart?: () => void;
}

const EmptyUsers: FC<EmptyUsersProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <svg viewBox="0 0 160 120" className="h-32 w-40" fill="none" aria-hidden="true">
        <ellipse cx="80" cy="104" rx="64" ry="12" fill="#eef0f4" />
        <rect x="50" y="14" width="60" height="78" rx="6" fill="#f3f4f7" stroke="#dfe3ea" />
        <rect x="64" y="8" width="32" height="10" rx="3" fill="#dfe3ea" />
        <circle cx="78" cy="48" r="13" stroke="#b8bfcc" strokeWidth="3" />
        <path d="M88 58l10 10" stroke="#b8bfcc" strokeWidth="3" strokeLinecap="round" />
        <rect x="62" y="74" width="36" height="4" rx="2" fill="#dfe3ea" />
      </svg>

      <p className="mt-4 text-sm font-semibold">No data yet</p>
      <p className="mt-1 text-xs text-[#5c6170]">Start configuring to collect your first users</p>
      <Button variant="secondary" size="sm" className="mt-5 rounded-lg px-5" onClick={onStart}>
        Start tutorial
      </Button>
    </div>
  );
};

export default EmptyUsers;
