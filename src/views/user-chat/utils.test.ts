import {
  formatDateLabel,
  formatListTime,
  formatMessageTime,
  getAvatarTone,
  getChatName,
} from '@/views/user-chat/utils';

describe('getChatName', () => {
  const base = { firstName: '', lastName: null, username: null, telegramUserId: '99' };

  it('姓名优先，其次用户名，最后是 Telegram 用户 id', () => {
    expect(getChatName({ ...base, firstName: 'Ada', lastName: 'Lovelace' })).toBe('Ada Lovelace');
    expect(getChatName({ ...base, firstName: 'Ada' })).toBe('Ada');
    expect(getChatName({ ...base, username: 'ada' })).toBe('ada');
    expect(getChatName(base)).toBe('99');
  });
});

describe('getAvatarTone', () => {
  it('同一个用户 id 始终得到同一种底色', () => {
    expect(getAvatarTone('6228099601')).toBe(getAvatarTone('6228099601'));
  });
});

describe('时间格式化', () => {
  it('气泡时间为 24 小时制，零点不出现 24', () => {
    expect(formatMessageTime(new Date(2024, 7, 15, 0, 5))).toBe('00:05');
    expect(formatMessageTime(new Date(2024, 7, 15, 11, 43))).toBe('11:43');
  });

  it('日期分隔文案', () => {
    expect(formatDateLabel(new Date(2024, 7, 15))).toBe('August 15, 2024');
  });

  it('列表时间：当天显示时刻，一周内显示星期，更早显示日期', () => {
    const now = new Date(2024, 7, 15, 12, 0);
    expect(formatListTime(new Date(2024, 7, 15, 11, 55), now)).toBe('11:55 AM');
    expect(formatListTime(new Date(2024, 7, 13, 9, 0), now)).toBe('Tue');
    expect(formatListTime(new Date(2024, 6, 1, 9, 0), now)).toBe('07/01/2024');
  });
});
