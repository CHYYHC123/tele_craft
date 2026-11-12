import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import Home from '@/views/home';

function renderHome() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <Home /> },
      { path: '/login', element: <h1>Login</h1> },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('Home', () => {
  it('点击按钮进入登录页', async () => {
    renderHome();

    await userEvent.click(screen.getByRole('button', { name: '去登录' }));

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });
});
