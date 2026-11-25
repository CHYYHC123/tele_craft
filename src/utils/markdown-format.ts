export type FormatKind = 'bold' | 'italic' | 'link' | 'bullet' | 'ordered';

export interface FormatResult {
  value: string;
  selStart: number;
  selEnd: number;
}

const BOLD_MARK = '**';
const ITALIC_MARK = '_';
const BOLD_PLACEHOLDER = 'bold text';
const ITALIC_PLACEHOLDER = 'italic text';
const LINK_PLACEHOLDER = 'text';
const LINK_URL_PLACEHOLDER = 'https://';

const BULLET_PREFIX = '- ';
const BULLET_PATTERN = /^- /;
const ORDERED_PATTERN = /^\d+\. /;

/** 在选区前后包裹标记；已被包裹则取消（toggle） */
function toggleWrap(
  value: string,
  selStart: number,
  selEnd: number,
  mark: string,
  placeholder: string,
): FormatResult {
  const before = value.slice(0, selStart);
  const selected = value.slice(selStart, selEnd);
  const after = value.slice(selEnd);

  // 标记在选区外侧：abc **[sel]** -> abc [sel]
  if (before.endsWith(mark) && after.startsWith(mark)) {
    return {
      value: before.slice(0, -mark.length) + selected + after.slice(mark.length),
      selStart: selStart - mark.length,
      selEnd: selEnd - mark.length,
    };
  }

  // 标记在选区内侧：[**sel**] -> [sel]
  if (selected.length >= mark.length * 2 && selected.startsWith(mark) && selected.endsWith(mark)) {
    const inner = selected.slice(mark.length, -mark.length);
    return { value: before + inner + after, selStart, selEnd: selStart + inner.length };
  }

  const text = selected || placeholder;
  const start = selStart + mark.length;
  return {
    value: `${before}${mark}${text}${mark}${after}`,
    selStart: start,
    selEnd: start + text.length,
  };
}

/** 选中文字变为 [文字](https://)，并选中 url 方便直接粘贴 */
function wrapLink(value: string, selStart: number, selEnd: number): FormatResult {
  const text = value.slice(selStart, selEnd) || LINK_PLACEHOLDER;
  const head = `[${text}](`;
  const next = `${value.slice(0, selStart)}${head}${LINK_URL_PLACEHOLDER})${value.slice(selEnd)}`;

  // 无选区时选中占位文字，便于直接改写；有选区时选中 url
  if (selStart === selEnd) {
    return { value: next, selStart: selStart + 1, selEnd: selStart + 1 + text.length };
  }
  const urlStart = selStart + head.length;
  return { value: next, selStart: urlStart, selEnd: urlStart + LINK_URL_PLACEHOLDER.length };
}

/** 对选区覆盖的整行加/去列表前缀；已全部是同类列表则移除（toggle） */
function toggleList(
  value: string,
  selStart: number,
  selEnd: number,
  kind: 'bullet' | 'ordered',
): FormatResult {
  const pattern = kind === 'bullet' ? BULLET_PATTERN : ORDERED_PATTERN;
  const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
  // 选区末尾恰好落在换行之后时，不把下一行算进来
  const effectiveEnd = selEnd > selStart && value[selEnd - 1] === '\n' ? selEnd - 1 : selEnd;
  const nextBreak = value.indexOf('\n', effectiveEnd);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(lineStart, lineEnd).split('\n');
  const allBlank = lines.every((line) => line.trim() === '');
  const isTarget = (line: string) => allBlank || line.trim() !== '';
  const targets = lines.filter(isTarget);
  const shouldRemove = targets.every((line) => pattern.test(line));

  let order = 0;
  const converted = lines.map((line) => {
    if (!isTarget(line)) return line;
    const plain = line.replace(BULLET_PATTERN, '').replace(ORDERED_PATTERN, '');
    if (shouldRemove) return plain;
    order += 1;
    return `${kind === 'bullet' ? BULLET_PREFIX : `${order}. `}${plain}`;
  });

  const block = converted.join('\n');
  return {
    value: value.slice(0, lineStart) + block + value.slice(lineEnd),
    selStart: lineStart,
    selEnd: lineStart + block.length,
  };
}

/**
 * 对 value 的 [selStart, selEnd) 选区应用 Markdown 格式，返回新文本与新选区。
 * 若结果超过 maxLength，则原样返回（textarea 的 maxLength 会吞掉超长输入，这里提前拦住）。
 */
export function applyFormat(
  value: string,
  selStart: number,
  selEnd: number,
  kind: FormatKind,
  maxLength = Number.POSITIVE_INFINITY,
): FormatResult {
  let result: FormatResult;
  switch (kind) {
    case 'bold':
      result = toggleWrap(value, selStart, selEnd, BOLD_MARK, BOLD_PLACEHOLDER);
      break;
    case 'italic':
      result = toggleWrap(value, selStart, selEnd, ITALIC_MARK, ITALIC_PLACEHOLDER);
      break;
    case 'link':
      result = wrapLink(value, selStart, selEnd);
      break;
    case 'bullet':
    case 'ordered':
      result = toggleList(value, selStart, selEnd, kind);
      break;
  }

  return result.value.length > maxLength ? { value, selStart, selEnd } : result;
}
