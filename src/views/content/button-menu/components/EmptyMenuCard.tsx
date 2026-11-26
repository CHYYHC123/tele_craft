import type { FC } from 'react';

import Button from '@/components/Button';

interface EmptyMenuCardProps {
  canAdd: boolean;
  onAdd: () => void;
}

const EmptyMenuCard: FC<EmptyMenuCardProps> = ({ canAdd, onAdd }) => {
  return (
    <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
      <p className="text-xl font-bold">No custom menu configured yet.</p>
      <p className="text-sm">
        Add quick-reply buttons on the left to build a bottom menu bar for your bot—helping users
        tap common actions instead of typing from scratch.
      </p>
      <div className="mt-5 flex justify-end border-t border-[#e4e7ee] pt-5">
        <Button className="rounded-lg" disabled={!canAdd} onClick={onAdd}>
          Add Button
        </Button>
      </div>
    </section>
  );
};

export default EmptyMenuCard;
