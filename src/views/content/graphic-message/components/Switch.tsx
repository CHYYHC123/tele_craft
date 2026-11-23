import type { FC } from 'react';

import { cn } from '@/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const Switch: FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors',
        checked ? 'bg-[#2F6EFF]' : 'bg-[#e4e7ee]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
};

export default Switch;
