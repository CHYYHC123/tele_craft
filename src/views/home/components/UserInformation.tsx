import { useState, type FC } from 'react';
import { Download, Search } from 'lucide-react';

import Button from '@/components/Button';
import EmptyUsers from '@/views/home/components/EmptyUsers';
import { USER_TABLE_COLUMNS } from '@/views/home/constants';

const UserInformation: FC = () => {
  const [keyword, setKeyword] = useState('');

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
        >
          Download all
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div
          role="row"
          className="grid min-w-176 grid-cols-[2.5rem_1.2fr_1fr_1.2fr_1fr_1.2fr_5rem] items-center bg-[#f3f4f6] px-4 py-3 text-xs text-[#6b7180]"
        >
          <input type="checkbox" aria-label="Select all" className="size-4" />
          {USER_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>

        <EmptyUsers />
      </div>
    </section>
  );
};

export default UserInformation;
