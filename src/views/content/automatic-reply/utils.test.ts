import {
  filterReplies,
  formatKeywords,
  parseKeywords,
} from '@/views/content/automatic-reply/utils';

const REPLIES = [
  { id: 'a', keywords: ['Hello', 'Hi'], content: 'a' },
  { id: 'b', keywords: ['Refund policy'], content: 'b' },
];

describe('filterReplies', () => {
  it('空搜索返回全部', () => {
    expect(filterReplies(REPLIES, '  ')).toEqual(REPLIES);
  });

  it('忽略大小写与首尾空格做模糊匹配', () => {
    expect(filterReplies(REPLIES, ' REFUND ')).toEqual([REPLIES[1]]);
  });

  it('命中任一关键词即可', () => {
    expect(filterReplies(REPLIES, 'hi')).toEqual([REPLIES[0]]);
  });

  it('无匹配返回空数组', () => {
    expect(filterReplies(REPLIES, 'xyz')).toEqual([]);
  });
});

describe('parseKeywords', () => {
  it('按中英文逗号和换行切分并去首尾空格', () => {
    expect(parseKeywords(' Hello , Hi，Help\nBye ')).toEqual(['Hello', 'Hi', 'Help', 'Bye']);
  });

  it('去空项并忽略大小写去重，保留首次写法', () => {
    expect(parseKeywords('Hello,,hello, HELLO ,Hi')).toEqual(['Hello', 'Hi']);
  });

  it('空输入返回空数组', () => {
    expect(parseKeywords('  ,， ')).toEqual([]);
  });
});

describe('formatKeywords', () => {
  it('用逗号加空格拼接', () => {
    expect(formatKeywords(['Hello', 'Hi'])).toBe('Hello, Hi');
  });
});
