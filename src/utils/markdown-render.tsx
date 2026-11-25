import type { ReactNode } from 'react';

/** 裸域名（如 example.com）自动高亮为链接样式 */
const DOMAIN_PATTERN = /([A-Za-z0-9-]+\.(?:com|net|org|io|uz))(?=[\s!.,?]|$)/g;
const BULLET_PATTERN = /^- (.*)$/;
const ORDERED_PATTERN = /^\d+\. (.*)$/;
// 依次匹配：粗体、斜体（两侧不能紧贴字母数字，避免 snake_case 误判）、[文字](url)
const INLINE_PATTERN =
  /\*\*(.+?)\*\*|(?<![A-Za-z0-9])_(?=\S)(.+?)(?<=\S)_(?![A-Za-z0-9])|\[([^\]]+)\]\(([^)\s]*)\)/g;

const LINK_CLASS = 'text-[#1d8cf8] underline';

/** 仅允许 http/https，防止 javascript: 等危险协议 */
function toSafeUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function renderPlain(text: string, keyPrefix: string, highlightDomain: boolean): ReactNode[] {
  if (!highlightDomain) return [text];
  // split 带捕获组时，奇数下标即匹配到的域名
  return text.split(DOMAIN_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <span key={`${keyPrefix}-d${index}`} className={LINK_CLASS}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function renderInline(text: string, keyPrefix: string, inLink = false): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const [raw, bold, italic, linkText, linkUrl] = match;
    const start = match.index;
    const key = `${keyPrefix}-${start}`;
    const safeUrl = linkText !== undefined && !inLink ? toSafeUrl(linkUrl) : null;

    // 非法链接（空 url / 危险协议）保持原文，交给后续纯文本处理
    if (linkText !== undefined && !safeUrl) continue;

    nodes.push(...renderPlain(text.slice(cursor, start), `${key}-p`, !inLink));
    if (bold !== undefined) {
      nodes.push(<strong key={key}>{renderInline(bold, key, inLink)}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic, key, inLink)}</em>);
    } else {
      nodes.push(
        <a
          key={key}
          href={safeUrl!}
          target="_blank"
          rel="noreferrer noopener"
          className={LINK_CLASS}
        >
          {renderInline(linkText, key, true)}
        </a>,
      );
    }
    cursor = start + raw.length;
  }

  nodes.push(...renderPlain(text.slice(cursor), `${keyPrefix}-tail`, !inLink));
  return nodes;
}

type Block = { type: 'text'; lines: string[] } | { type: 'bullet' | 'ordered'; items: string[] };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const line of text.split('\n')) {
    const bullet = BULLET_PATTERN.exec(line);
    const ordered = bullet ? null : ORDERED_PATTERN.exec(line);
    const listMatch = bullet ?? ordered;
    const last = blocks.at(-1);

    if (listMatch) {
      const type = bullet ? 'bullet' : 'ordered';
      if (last && last.type === type) last.items.push(listMatch[1]);
      else blocks.push({ type, items: [listMatch[1]] });
    } else if (last && last.type === 'text') {
      last.lines.push(line);
    } else {
      blocks.push({ type: 'text', lines: [line] });
    }
  }
  return blocks;
}

/**
 * 把编辑器里的 Markdown 文本渲染为 React 节点（预览用）。
 * 支持 **粗体**、_斜体_、[文字](url)、"- " 无序列表、"1. " 有序列表；不使用 dangerouslySetInnerHTML。
 */
export function renderMarkdown(text: string): ReactNode {
  return parseBlocks(text).map((block, index) => {
    const key = `b${index}`;
    if (block.type === 'text') {
      return (
        <p key={key} className="wrap-break-word whitespace-pre-wrap">
          {renderInline(block.lines.join('\n'), key)}
        </p>
      );
    }
    const List = block.type === 'bullet' ? 'ul' : 'ol';
    const listStyle = block.type === 'bullet' ? 'list-disc' : 'list-decimal';
    return (
      <List key={key} className={`${listStyle} pl-4`}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderInline(item, `${key}-${itemIndex}`)}</li>
        ))}
      </List>
    );
  });
}
