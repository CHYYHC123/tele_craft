import type { FC } from 'react';

import MenuPanelActions from '@/views/content/button-menu/components/MenuPanelActions';

const EmptyMenuCard: FC = () => {
  return (
    <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
      <p className="text-sm">
        You have not added a custom menu. Click Add Menu on the left to create a menu bar for Bot.
      </p>
      <div className="mt-5 flex justify-end border-t border-[#e4e7ee] pt-5">
        <MenuPanelActions />
      </div>
    </section>
  );
};

export default EmptyMenuCard;
