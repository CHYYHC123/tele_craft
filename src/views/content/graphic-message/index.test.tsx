import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GraphicMessage from '@/views/content/graphic-message';

describe('GraphicMessage', () => {
  it('切换到文本消息后隐藏图片上传', async () => {
    render(<GraphicMessage />);

    expect(screen.getByText('Click to upload')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));

    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument();
  });

  it('开启操作按钮并填写名称后，在预览里显示', async () => {
    render(<GraphicMessage />);

    expect(screen.queryByLabelText('Button name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));
    await userEvent.type(screen.getByLabelText('Button name'), 'Pay now');

    expect(screen.getByText('Pay now', { selector: 'li' })).toBeInTheDocument();
  });

  it('可以新增并删除操作按钮', async () => {
    render(<GraphicMessage />);

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add new action button' }));

    expect(screen.getAllByLabelText('Button name')).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Remove action button' }));

    expect(screen.getAllByLabelText('Button name')).toHaveLength(1);
  });
});
