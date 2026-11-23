import { filterReplies } from '@/views/content/automatic-reply/utils';

const REPLIES = [
  { id: 1, keywords: 'Hello', content: 'a' },
  { id: 2, keywords: 'Refund policy', content: 'b' },
];

describe('filterReplies', () => {
  it('空搜索返回全部', () => {
    expect(filterReplies(REPLIES, '  ')).toEqual(REPLIES);
  });

  it('忽略大小写与首尾空格做模糊匹配', () => {
    expect(filterReplies(REPLIES, ' REFUND ')).toEqual([REPLIES[1]]);
  });

  it('无匹配返回空数组', () => {
    expect(filterReplies(REPLIES, 'xyz')).toEqual([]);
  });
});
