import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WelcomeMessage from '@/views/content/welcome-message';
import { WELCOME_MESSAGE_MAX_LENGTH } from '@/views/content/welcome-message/constants';

describe('WelcomeMessage', () => {
  it('编辑描述时同步更新预览和剩余字数', async () => {
    render(<WelcomeMessage />);

    const textarea = screen.getByRole('textbox', { name: /Description/ });
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Hi there');

    // 限定 p，排除 textarea 自身的文本
    expect(screen.getByText('Hi there', { selector: 'p' })).toBeInTheDocument();
    expect(
      screen.getByText(`${WELCOME_MESSAGE_MAX_LENGTH - 'Hi there'.length} characters left`),
    ).toBeInTheDocument();
  });
});
