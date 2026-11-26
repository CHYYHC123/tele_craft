import type { FC } from 'react';

import Button from '@/components/Button';

interface MenuPanelActionsProps {
  publishing: boolean;
  canPublish: boolean;
  canCancel: boolean;
  onPublish: () => void;
  onCancel: () => void;
}

const MenuPanelActions: FC<MenuPanelActionsProps> = ({
  publishing,
  canPublish,
  canCancel,
  onPublish,
  onCancel,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        className="rounded-lg"
        disabled={!canCancel || publishing}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button className="rounded-lg" disabled={!canPublish || publishing} onClick={onPublish}>
        {publishing ? 'Publishing...' : 'Save and publish'}
      </Button>
    </div>
  );
};

export default MenuPanelActions;
