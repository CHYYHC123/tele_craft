import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';

import Button from '@/components/Button';
import Switch from '@/components/Switch';
import type { BotMenu, MenuStrategy, MenuStrategyType } from '@/types/bot';
import { cn } from '@/utils';
import { DISPATCH_CHANNELS, DISPATCH_CHANNEL_NOTES } from '@/views/content/button-menu/constants';

interface DispatchStrategyCardProps {
  value: MenuStrategy;
  /** 可作为 /menu 默认回复的命令菜单项 */
  menus: BotMenu[];
  canSave: boolean;
  saving: boolean;
  onToggle: (enabled: boolean) => void;
  onSelectStrategy: (strategy: MenuStrategyType) => void;
  onSelectDefaultMenu: (menuId: string | null) => void;
  onSave: () => void;
}

/** 下发策略：总开关 + 单选下发渠道（Bot 级，与选中的按钮无关） */
const DispatchStrategyCard: FC<DispatchStrategyCardProps> = ({
  value,
  menus,
  canSave,
  saving,
  onToggle,
  onSelectStrategy,
  onSelectDefaultMenu,
  onSave,
}) => {
  const { enabled, strategy, defaultMenuId } = value;
  // 默认菜单项被删掉后 id 会失效，这时下拉回到“未选择”
  const selectedMenuId = menus.some((menu) => menu.id === defaultMenuId) ? defaultMenuId : null;
  const note = DISPATCH_CHANNEL_NOTES[strategy];

  return (
    <section className="w-full min-w-0 rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e7ee] pb-5">
        <div>
          <h2 className="text-base font-semibold">Dispatch strategy</h2>
          <p className="mt-0.5 text-xs text-[#5c6170]">
            Choose how the menu is delivered to users.
          </p>
        </div>
        <Switch checked={enabled} onChange={onToggle} label="Dispatch strategy" />
      </header>

      <div className={cn('pt-5', !enabled && 'opacity-50')}>
        <div
          role="radiogroup"
          aria-label="Dispatch channel"
          className="flex flex-wrap items-center gap-6"
        >
          {DISPATCH_CHANNELS.map((item) => (
            <label
              key={item.id}
              className={cn(
                'flex items-center gap-2 text-sm',
                enabled ? 'cursor-pointer' : 'cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                name="dispatch-channel"
                value={item.id}
                disabled={!enabled}
                checked={strategy === item.id}
                onChange={() => onSelectStrategy(item.id)}
                className="size-4 cursor-pointer accent-[#2F6EFF] disabled:cursor-not-allowed"
              />
              <span
                className="grid size-5 place-items-center rounded border border-[#c9cedb] text-[#5c6170]"
                aria-hidden="true"
              >
                <item.icon className="size-3.5" strokeWidth={1.8} />
              </span>
              {item.label}
            </label>
          ))}
        </div>

        <div className="mt-4">
          {strategy === 'command' ? (
            <>
              <div className="relative">
                <select
                  aria-label="Default /menu command"
                  disabled={!enabled}
                  value={selectedMenuId ?? ''}
                  onChange={(event) => onSelectDefaultMenu(event.target.value || null)}
                  className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#e4e7ee] bg-white pr-9 pl-3 text-sm outline-none focus:border-[#2F6EFF] disabled:cursor-not-allowed disabled:bg-[#f5f6f9] disabled:text-[#8a90a0]"
                >
                  <option value="">Default /menu command</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      /{menu.command}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#8a90a0]"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs text-[#5c6170]">
                Users who send /menu get the reply of the selected command.
              </p>
            </>
          ) : (
            <p className="text-sm text-[#5c6170]">{note}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-[#e4e7ee] pt-5">
        <Button className="rounded-lg" disabled={!canSave || saving} onClick={onSave}>
          {saving ? 'Saving...' : 'Save strategy'}
        </Button>
      </div>
    </section>
  );
};

export default DispatchStrategyCard;
