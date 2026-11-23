import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddMenu from '@/views/content/add-menu';
import { ADD_MENU_MAX_COUNT } from '@/views/content/add-menu/constants';

// 没有菜单时按钮叫「Add menu」，已有菜单后叫「Add」
const addItem = () => userEvent.click(screen.getByRole('button', { name: /^Add( menu)?$/ }));

const nameInput = () => screen.getByRole('textbox', { name: 'Menu name' });

describe('AddMenu', () => {
  it('初始没有自定义菜单时显示空状态，且没有默认的 /start', () => {
    render(<AddMenu />);

    expect(screen.getByText(/You have not added a custom menu/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add menu' })).toBeInTheDocument();
    expect(screen.queryByText('/start')).not.toBeInTheDocument();
  });

  it('新增菜单后选中它，显示 /start 和消息配置', async () => {
    render(<AddMenu />);

    await addItem();

    expect(screen.getByText('/start')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\/menu name/, pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Menu information')).toBeInTheDocument();
    expect(screen.queryByText(/You have not added a custom menu/)).not.toBeInTheDocument();
  });

  it('填写名称和描述后，预览里同步显示', async () => {
    render(<AddMenu />);

    await addItem();
    await userEvent.type(nameInput(), 'help');
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu description' }), 'Get support');

    expect(screen.getByText('/help')).toBeInTheDocument();
    expect(screen.getByText('Get support')).toBeInTheDocument();
  });

  it('消息类型切换后，显示对应的配置项', async () => {
    render(<AddMenu />);

    await addItem();
    expect(screen.getByText('Click to upload')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Link' }));
    expect(screen.getByRole('textbox', { name: 'External link' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Description' })).not.toBeInTheDocument();
  });

  it('每个菜单保留各自的消息类型', async () => {
    render(<AddMenu />);

    await addItem();
    await userEvent.type(nameInput(), 'first');
    await userEvent.click(screen.getByRole('radio', { name: 'Link' }));
    await addItem();

    // 新增的菜单默认是图文消息
    expect(screen.getByRole('radio', { name: 'Graphic message' })).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: /\/first/ }));

    expect(screen.getByRole('radio', { name: 'Link' })).toBeChecked();
  });

  it('可以上移选中的菜单，第一项的上移按钮不可用', async () => {
    render(<AddMenu />);

    await addItem();
    await userEvent.type(nameInput(), 'first');
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();

    await addItem();
    await userEvent.type(nameInput(), 'second');
    await userEvent.click(screen.getByRole('button', { name: 'Move up' }));

    const labels = screen
      .getAllByRole('button', { name: /^\/(first|second)/ })
      .map((button) => button.textContent);
    expect(labels[0]).toContain('/second');
    expect(labels[1]).toContain('/first');
  });

  it('删除选中的菜单后，选中相邻的一项；全部删完回到空状态', async () => {
    render(<AddMenu />);

    await addItem();
    await userEvent.type(nameInput(), 'first');
    await addItem();
    await userEvent.type(nameInput(), 'second');

    await userEvent.click(screen.getByRole('button', { name: 'Delete menu' }));
    expect(screen.getByRole('button', { name: /\/first/, pressed: true })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete menu' }));
    expect(screen.getByText(/You have not added a custom menu/)).toBeInTheDocument();
  });

  it('开启操作按钮后可以填写名称', async () => {
    render(<AddMenu />);

    await addItem();
    expect(screen.queryByLabelText('Button name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));

    expect(screen.getByLabelText('Button name')).toBeInTheDocument();
  });

  it('达到上限后隐藏新增按钮', async () => {
    render(<AddMenu />);

    for (let i = 0; i < ADD_MENU_MAX_COUNT; i++) {
      await addItem();
    }

    expect(screen.queryByRole('button', { name: /^Add( menu)?$/ })).not.toBeInTheDocument();
  });
});
