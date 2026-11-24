import type { FC } from 'react';
import { Download, Search } from 'lucide-react';

import Button from '@/components/Button';
import { formatDateTime } from '@/utils/format';
import EmptyUsers from '@/views/home/components/EmptyUsers';
import { USER_TABLE_COLUMNS } from '@/views/home/constants';
import { useSubscribers } from '@/views/home/hooks/useSubscribers';
import { getSubscriberName } from '@/views/home/utils';

const ROW_CLASS =
  'grid min-w-176 grid-cols-[2.5rem_1.2fr_1fr_1.2fr_1fr_1.2fr_5rem] items-center px-4 py-3 text-sm';

interface UserInformationProps {
  botId?: string;
}

const UserInformation: FC<UserInformationProps> = ({ botId }) => {
  const { keyword, setKeyword, page, setPage, totalPages, total, items, isExporting, exportAll } =
    useSubscribers(botId);

  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="text-xl font-semibold">User information</h2>

      <div className="mt-4 flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a90a0]"
            strokeWidth={1.8}
          />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="h-10 w-full rounded-lg border border-[#e4e7ee] pr-3 pl-9 text-sm outline-none placeholder:text-[#b0b5c2] focus:border-[#2F6EFF]"
          />
        </label>

        <Button
          variant="secondary"
          size="sm"
          className="h-10 rounded-lg px-4"
          icon={<Download className="size-4" strokeWidth={1.8} />}
          disabled={!botId || isExporting}
          onClick={exportAll}
        >
          {isExporting ? 'Downloading...' : 'Download all'}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div role="row" className={`${ROW_CLASS} bg-[#f3f4f6] py-3 text-xs text-[#6b7180]`}>
          <input type="checkbox" aria-label="Select all" className="size-4" />
          {USER_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>

        {items.length === 0 ? (
          <EmptyUsers />
        ) : (
          items.map((item) => (
            <div
              key={item.telegramUserId}
              role="row"
              className={`${ROW_CLASS} border-b border-[#eef0f4] last:border-b-0`}
            >
              <input
                type="checkbox"
                aria-label={`Select ${getSubscriberName(item)}`}
                className="size-4"
              />
              <span className="truncate">{getSubscriberName(item)}</span>
              <span className="truncate text-[#5c6170]">
                {item.username ? `@${item.username}` : '--'}
              </span>
              <span className="text-[#5c6170]">{formatDateTime(item.firstSeenAt)}</span>
              <span className="text-[#5c6170]">{formatDateTime(item.lastActiveAt)}</span>
              <span className="text-[#5c6170]">{item.phone ?? '--'}</span>
              <span className="text-[#5c6170]">--</span>
            </div>
          ))
        )}
      </div>

      {total > 0 ? (
        <div className="mt-4 flex items-center justify-between text-xs text-[#5c6170]">
          <span>
            Total {total} · Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default UserInformation;
