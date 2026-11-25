import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { renderMarkdown } from '@/utils/markdown-render';

function renderText(text: string) {
  return render(<div>{renderMarkdown(text)}</div>);
}

describe('renderMarkdown', () => {
  it('渲染粗体与斜体', () => {
    const { container } = renderText('a **bold** and _italic_');
    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('em')).toHaveTextContent('italic');
  });

  it('不把 snake_case 当作斜体', () => {
    const { container } = renderText('my_var_name');
    expect(container.querySelector('em')).toBeNull();
    expect(screen.getByText('my_var_name')).toBeInTheDocument();
  });

  it('渲染 http(s) 链接', () => {
    renderText('[docs](https://example.com/a)');
    const link = screen.getByRole('link', { name: 'docs' });
    expect(link).toHaveAttribute('href', 'https://example.com/a');
  });

  it('javascript: 与空 url 的链接不渲染为 a，保持原文', () => {
    const { container } = renderText('[x](javascript:alert(1)) [y](https://)');
    expect(container.querySelector('a')).toBeNull();
    expect(container).toHaveTextContent('[y](https://)');
  });

  it('渲染无序与有序列表', () => {
    const { container } = renderText('- a\n- b\n1. c\n2. d');
    expect(container.querySelectorAll('ul > li')).toHaveLength(2);
    expect(container.querySelectorAll('ol > li')).toHaveLength(2);
  });

  it('保留裸域名高亮', () => {
    renderText('visit example.com now');
    expect(screen.getByText('example.com')).toHaveClass('underline');
  });

  it('保留换行', () => {
    const { container } = renderText('line1\nline2');
    expect(container.querySelector('p')?.textContent).toBe('line1\nline2');
  });
});
