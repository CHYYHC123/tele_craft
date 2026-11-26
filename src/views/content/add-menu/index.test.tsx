import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';

import { resetMockBots, resetMockMenus } from '@/mocks/handlers';
import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useBotStore } from '@/store/bot';
import { useUserStore } from '@/store/user';
import type { BotMenu, BotMenuParams } from '@/types/bot';
import { DEFAULT_MESSAGE } from '@/utils/message-config';
import AddMenu from '@/views/content/add-menu';
import { ADD_MENU_MAX_COUNT } from '@/views/content/add-menu/constants';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BOT = { id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Bit Store Card' };

const menu = (patch: Partial<BotMenu> = {}): BotMenu => ({
  id: 'm1',
  command: 'support',
  commandDescription: 'Contact support',
  messageType: 'text',
  imageUrl: null,
  description: 'Hello',
  linkUrl: null,
  buttonsEnabled: false,
  buttons: [],
  ...patch,
});

/** 预览里的新增按钮。空状态时右侧卡片也有一个同名按钮，预览的排在前面 */
const addItem = () => userEvent.click(screen.getAllByRole('button', { name: /^Add( menu)?$/ })[0]);

const nameInput = () => screen.getByRole('textbox', { name: 'Menu name' });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AddMenu />
    </QueryClientProvider>,
  );
}

describe('AddMenu', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-menu',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
    resetMockMenus();
    useBotStore.getState().setSelectedBotId(BOT.id);
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
    resetMockMenus();
  });

  it('初始没有自定义菜单时显示空状态，且没有默认的 /start', async () => {
    renderPage();

    expect(await screen.findByText(/You have not added a custom menu/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add menu' })).toHaveLength(2);
    expect(screen.queryByText('/start')).not.toBeInTheDocument();
    expect(screen.getByText(BOT.displayName)).toBeInTheDocument();
  });

  it('新增菜单后选中它，显示 /start 和消息配置', async () => {
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();

    expect(screen.getByText('/start')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\/menu name/, pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Menu information')).toBeInTheDocument();
    expect(screen.queryByText(/You have not added a custom menu/)).not.toBeInTheDocument();
  });

  it('填写名称和描述后，预览里同步显示', async () => {
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();
    await userEvent.type(nameInput(), 'help');
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu description' }), 'Get support');

    expect(screen.getByText('/help')).toBeInTheDocument();
    expect(screen.getByText('Get support')).toBeInTheDocument();
  });

  it('消息类型切换后，显示对应的配置项', async () => {
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

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
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();
    await userEvent.type(nameInput(), 'first');
    await userEvent.click(screen.getByRole('radio', { name: 'Link' }));
    await addItem();

    expect(screen.getByRole('radio', { name: 'Graphic message' })).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: /\/first/ }));

    expect(screen.getByRole('radio', { name: 'Link' })).toBeChecked();
  });

  it('上箭头只选中上一项，不改变顺序', async () => {
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();
    await userEvent.type(nameInput(), 'first');
    expect(screen.getByRole('button', { name: 'Select previous menu' })).toBeDisabled();

    await addItem();
    await userEvent.type(nameInput(), 'second');
    await userEvent.click(screen.getByRole('button', { name: 'Select previous menu' }));

    expect(screen.getByRole('button', { name: /\/first/, pressed: true })).toBeInTheDocument();
    const labels = screen
      .getAllByRole('button', { name: /^\/(first|second)/ })
      .map((button) => button.textContent);
    expect(labels[0]).toContain('/first');
    expect(labels[1]).toContain('/second');
  });

  it('删除未发布的草稿后选中相邻项；全部删完回到空状态', async () => {
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

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
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();
    expect(screen.queryByLabelText('Button name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));

    expect(screen.getByLabelText('Button name')).toBeInTheDocument();
  });

  it('达到上限后隐藏新增按钮', async () => {
    resetMockMenus({
      b1: Array.from({ length: ADD_MENU_MAX_COUNT }, (_, index) =>
        menu({ id: `m${index}`, command: `cmd${index}` }),
      ),
    });
    renderPage();

    expect(await screen.findByRole('button', { name: /\/cmd0/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Add( menu)?$/ })).not.toBeInTheDocument();
  });

  it('保存新菜单时 POST，命令去掉斜杠并转成小写', async () => {
    let body: BotMenuParams | undefined;
    server.use(
      http.post(`${API}/bots/b1/menus`, async ({ request }) => {
        body = (await request.json()) as BotMenuParams;
        return apiOk({ id: 'm-new', ...body });
      }),
    );
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();
    await userEvent.type(nameInput(), '/Support');
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Menu description' }),
      'Contact support',
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(body?.command).toBe('support'));
    expect(body).toMatchObject({
      commandDescription: 'Contact support',
      messageType: 'text',
      imageUrl: null,
      description: DEFAULT_MESSAGE,
      linkUrl: null,
      buttonsEnabled: false,
      buttons: [],
    });
    expect(nameInput()).toHaveValue('support');
  });

  it('修改已发布菜单时 PUT', async () => {
    resetMockMenus({ b1: [menu()] });
    let body: BotMenuParams | undefined;
    server.use(
      http.put(`${API}/bots/b1/menus/m1`, async ({ request }) => {
        body = (await request.json()) as BotMenuParams;
        return apiOk({ id: 'm1', ...body });
      }),
    );
    renderPage();

    expect(await screen.findByRole('textbox', { name: 'Menu name' })).toHaveValue('support');
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeDisabled();

    await userEvent.clear(nameInput());
    await userEvent.type(nameInput(), 'help');
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(body?.command).toBe('help'));
    expect(body).toMatchObject({
      commandDescription: 'Contact support',
      messageType: 'text',
      description: 'Hello',
    });
  });

  it('Cancel 恢复已发布内容，并且不请求接口', async () => {
    resetMockMenus({ b1: [menu()] });
    let called = false;
    server.use(
      http.post(`${API}/bots/b1/menus`, () => {
        called = true;
        return apiFail('BAD_REQUEST', '不应请求', 400);
      }),
      http.put(`${API}/bots/b1/menus/:menuId`, () => {
        called = true;
        return apiFail('BAD_REQUEST', '不应请求', 400);
      }),
    );
    renderPage();

    expect(await screen.findByRole('textbox', { name: 'Menu name' })).toHaveValue('support');
    await userEvent.clear(nameInput());
    await userEvent.type(nameInput(), 'other');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(nameInput()).toHaveValue('support');
    expect(called).toBe(false);
  });

  it('删除已发布菜单时 DELETE，并选中相邻项', async () => {
    resetMockMenus({
      b1: [menu(), menu({ id: 'm2', command: 'help', commandDescription: 'Get help' })],
    });
    let deleted = false;
    server.use(
      http.delete(`${API}/bots/b1/menus/m1`, () => {
        deleted = true;
        return apiOk(null);
      }),
    );
    renderPage();

    expect(
      await screen.findByRole('button', { name: /\/support/, pressed: true }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete menu' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /\/help/, pressed: true })).toBeInTheDocument(),
    );
    expect(deleted).toBe(true);
    expect(screen.queryByRole('button', { name: /\/support/ })).not.toBeInTheDocument();
  });

  it('图文保存时先上传图片，再带上返回的地址', async () => {
    let uploadedName: string | undefined;
    let body: BotMenuParams | undefined;
    const imageUrl = 'https://example.blob.upstash.io/bots/b1/menus/banner.png';
    server.use(
      http.post(`${API}/bots/b1/menus/image`, async ({ request }) => {
        const form = await request.formData();
        uploadedName = (form.get('file') as File | null)?.name;
        return apiOk({ imageUrl });
      }),
      http.post(`${API}/bots/b1/menus`, async ({ request }) => {
        body = (await request.json()) as BotMenuParams;
        return apiOk({ id: 'm-img', ...body });
      }),
    );
    renderPage();
    await screen.findByText(/You have not added a custom menu/);

    await addItem();
    await userEvent.type(nameInput(), 'promo');
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu description' }), 'Banner');
    const file = new File(['png'], 'banner.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText(/Click to upload/), file);
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(body?.imageUrl).toBe(imageUrl));
    expect(uploadedName).toBe('banner.png');
    expect(body).toMatchObject({ command: 'promo', messageType: 'graphic' });
  });
});
