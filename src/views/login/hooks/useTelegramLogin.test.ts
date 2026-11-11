import { appendTelegramOrigin } from '@/views/login/hooks/useTelegramLogin';

describe('appendTelegramOrigin', () => {
  it('给 Telegram 授权地址补上 origin', () => {
    const url = appendTelegramOrigin(
      'https://oauth.telegram.org/auth?response_type=post_message&client_id=1',
      'http://localhost:5173',
    );
    expect(new URL(url).searchParams.get('origin')).toBe('http://localhost:5173');
  });

  it('保留已有 origin，也不改其它地址', () => {
    const withOrigin =
      'https://oauth.telegram.org/auth?response_type=post_message&origin=https%3A%2F%2Fapp.example';
    expect(appendTelegramOrigin(withOrigin, 'http://localhost:5173')).toBe(
      new URL(withOrigin).toString(),
    );
    expect(appendTelegramOrigin('https://example.com/auth', 'http://localhost:5173')).toBe(
      'https://example.com/auth',
    );
  });
});
