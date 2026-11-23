import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserChat from '@/views/user-chat';

describe('UserChat', () => {
  it('未选择会话时提示选择，选择后显示消息', async () => {
    render(<UserChat />);

    expect(screen.getByText('Please select chat')).toBeInTheDocument();
    expect(screen.getByText('Open chats')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Ahmet/ }));

    expect(screen.queryByText('Please select chat')).not.toBeInTheDocument();
    expect(screen.getByText('Yes, that would be great.')).toBeInTheDocument();
  });

  it('静音会话后从 Open 列表移除，并出现在 Muted chats', async () => {
    render(<UserChat />);

    await userEvent.click(screen.getByRole('button', { name: /Ahmet/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mute chat' }));
    await userEvent.click(screen.getByRole('menuitem', { name: '12 hours' }));

    expect(screen.getByText('Please select chat')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ahmet/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Chat folders' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Muted chats/ }));

    expect(screen.getByRole('button', { name: /Ahmet/ })).toBeInTheDocument();
  });

  it('Muted chats 为空时显示 No chat yet', async () => {
    render(<UserChat />);

    await userEvent.click(screen.getByRole('button', { name: 'Chat folders' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Muted chats/ }));

    expect(screen.getByText('No chat yet')).toBeInTheDocument();
  });

  it('发送消息后追加到会话', async () => {
    render(<UserChat />);

    await userEvent.click(screen.getByRole('button', { name: /xiao.*11:46/ }));
    await userEvent.type(screen.getByLabelText('Message'), 'Hi there{Enter}');

    expect(screen.getByText('Hi there', { selector: 'p' })).toBeInTheDocument();
  });
});
