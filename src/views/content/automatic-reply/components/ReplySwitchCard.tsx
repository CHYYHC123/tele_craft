import type { FC } from 'react';

import Switch from '@/components/Switch';

interface ReplySwitchCardProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ReplySwitchCard: FC<ReplySwitchCardProps> = ({ title, description, checked, onChange }) => {
  return (
    <section className="rounded-2xl bg-white p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <Switch checked={checked} onChange={onChange} label={title} />
      </div>
      <p className="mt-2 text-xs text-[#5c6170]">{description}</p>
    </section>
  );
};

export default ReplySwitchCard;
