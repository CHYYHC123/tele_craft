import { describe, it, expect } from 'vitest';

import { applyFormat } from '@/utils/markdown-format';

describe('applyFormat', () => {
  it('bold 包裹选区并保持选中原文', () => {
    const r = applyFormat('hello world', 6, 11, 'bold');
    expect(r.value).toBe('hello **world**');
    expect(r.value.slice(r.selStart, r.selEnd)).toBe('world');
  });

  it('bold 无选区时插入占位并选中占位', () => {
    const r = applyFormat('ab', 1, 1, 'bold');
    expect(r.value).toBe('a**bold text**b');
    expect(r.value.slice(r.selStart, r.selEnd)).toBe('bold text');
  });

  it('bold 再点一次取消（标记在选区外）', () => {
    const r = applyFormat('hello **world**', 8, 13, 'bold');
    expect(r.value).toBe('hello world');
    expect(r.value.slice(r.selStart, r.selEnd)).toBe('world');
  });

  it('bold 取消（标记在选区内）', () => {
    const r = applyFormat('hello **world**', 6, 15, 'bold');
    expect(r.value).toBe('hello world');
    expect(r.value.slice(r.selStart, r.selEnd)).toBe('world');
  });

  it('italic 使用下划线包裹', () => {
    const r = applyFormat('hi there', 3, 8, 'italic');
    expect(r.value).toBe('hi _there_');
  });

  it('link 选中文字并选中 url 占位', () => {
    const r = applyFormat('see docs', 4, 8, 'link');
    expect(r.value).toBe('see [docs](https://)');
    expect(r.value.slice(r.selStart, r.selEnd)).toBe('https://');
  });

  it('link 无选区时插入占位文字', () => {
    const r = applyFormat('', 0, 0, 'link');
    expect(r.value).toBe('[text](https://)');
    expect(r.value.slice(r.selStart, r.selEnd)).toBe('text');
  });

  it('bullet 对选区覆盖的多行加前缀，空行跳过', () => {
    const r = applyFormat('a\n\nb\nc', 0, 4, 'bullet');
    expect(r.value).toBe('- a\n\n- b\nc');
  });

  it('bullet 全部已是列表时移除', () => {
    const r = applyFormat('- a\n- b', 0, 7, 'bullet');
    expect(r.value).toBe('a\nb');
  });

  it('ordered 连续编号，并能把无序列表转换为有序', () => {
    const r = applyFormat('- a\nb\nc', 0, 7, 'ordered');
    expect(r.value).toBe('1. a\n2. b\n3. c');
  });

  it('光标在行中间时作用于整行', () => {
    const r = applyFormat('x\nhello', 4, 4, 'bullet');
    expect(r.value).toBe('x\n- hello');
  });

  it('结果超过 maxLength 时原样返回', () => {
    const r = applyFormat('hello', 0, 5, 'bold', 6);
    expect(r).toEqual({ value: 'hello', selStart: 0, selEnd: 5 });
  });
});
