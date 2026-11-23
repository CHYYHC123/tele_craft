import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ButtonMenu from '@/views/content/button-menu';
import { BUTTON_MENU_MAX_COUNT } from '@/views/content/button-menu/constants';

const addButton = () => userEvent.click(screen.getByRole('button', { name: 'Add a button' }));

describe('ButtonMenu', () => {
  it('初始没有按钮时显示空状态', () => {
    render(<ButtonMenu />);

    expect(screen.getByText(/You have not added a custom menu/)).toBeInTheDocument();
    expect(screen.queryByText('Menu information')).not.toBeInTheDocument();
  });

  it('新增按钮后选中它，并显示消息配置', async () => {
    render(<ButtonMenu />);

    await addButton();

    expect(screen.getByRole('button', { name: 'Button', pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Menu information')).toBeInTheDocument();
    expect(screen.queryByText(/You have not added a custom menu/)).not.toBeInTheDocument();
  });

  it('填写菜单名称后，预览里的按钮同步显示', async () => {
    render(<ButtonMenu />);

    await addButton();
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu name' }), 'Create Card');

    expect(screen.getByRole('button', { name: 'Create Card' })).toBeInTheDocument();
  });

  it('切换按钮时，右侧显示各自的配置', async () => {
    render(<ButtonMenu />);

    await addButton();
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu name' }), 'First');
    await addButton();

    expect(screen.getByRole('textbox', { name: 'Menu name' })).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'First' }));

    expect(screen.getByRole('textbox', { name: 'Menu name' })).toHaveValue('First');
  });

  it('消息类型切换后，显示对应的配置项', async () => {
    render(<ButtonMenu />);

    await addButton();
    expect(screen.getByText('Click to upload')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Link' }));
    expect(screen.getByRole('textbox', { name: 'Link URL' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Description' })).not.toBeInTheDocument();
  });

  it('开启操作按钮后可以填写名称', async () => {
    render(<ButtonMenu />);

    await addButton();
    expect(screen.queryByLabelText('Button name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));

    expect(screen.getByLabelText('Button name')).toBeInTheDocument();
  });

  it('删除按钮后回到空状态', async () => {
    render(<ButtonMenu />);

    await addButton();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Button' }));

    expect(screen.getByText(/You have not added a custom menu/)).toBeInTheDocument();
  });

  it('删除选中的按钮后，自动选中剩下的第一个', async () => {
    render(<ButtonMenu />);

    await addButton();
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu name' }), 'First');
    await addButton();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Button' }));

    expect(screen.getByRole('button', { name: 'First', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Menu name' })).toHaveValue('First');
  });

  it('达到上限后隐藏新增按钮', async () => {
    render(<ButtonMenu />);

    for (let i = 0; i < BUTTON_MENU_MAX_COUNT; i++) {
      await addButton();
    }

    expect(screen.queryByRole('button', { name: 'Add a button' })).not.toBeInTheDocument();
  });

  it('把一个按钮拖到另一个按钮上，两者并排在同一行', async () => {
    render(<ButtonMenu />);

    await addButton();
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu name' }), 'First');
    await addButton();
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu name' }), 'Second');

    expect(screen.getAllByRole('group', { name: 'Menu row' })).toHaveLength(2);

    const dataTransfer = { setData: () => {}, effectAllowed: '' };
    const dragged = screen.getByRole('button', { name: 'Second' }).parentElement!;
    const target = screen.getByRole('button', { name: 'First' }).parentElement!;

    fireEvent.dragStart(dragged, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(screen.getAllByRole('group', { name: 'Menu row' })).toHaveLength(1);
  });
});
