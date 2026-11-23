import type { FC } from 'react';

import Button from '@/components/Button';

const MenuPanelActions: FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" className="rounded-lg">
        Cancel
      </Button>
      <Button className="rounded-lg">Save</Button>
    </div>
  );
};

export default MenuPanelActions;
