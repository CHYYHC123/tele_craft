import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import DescriptionEditor from '@/components/DescriptionEditor';

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <DescriptionEditor value={value} maxLength={50} onChange={setValue} />;
}

describe('DescriptionEditor 工具栏', () => {
  it('点击 Bold 给选中文字加粗', async () => {
    render(<Harness initial="hello world" />);
    const textarea = screen.getByRole('textbox', { name: 'Description' }) as HTMLTextAreaElement;
    textarea.setSelectionRange(6, 11);

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));

    expect(textarea).toHaveValue('hello **world**');
  });

  it('点击 Bulleted list 给当前行加列表前缀', async () => {
    render(<Harness initial="item" />);

    await userEvent.click(screen.getByRole('button', { name: 'Bulleted list' }));

    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('- item');
  });
});
