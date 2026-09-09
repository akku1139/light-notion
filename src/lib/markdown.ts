import type { NotionBlock } from './notion';

interface RichTextItem {
  plain_text: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
  href?: string | null;
}

function richTextToMarkdown(items: RichTextItem[]): string {
  return items.map(item => {
    let text = item.plain_text;
    if (!text) return '';

    const ann = item.annotations;
    if (ann?.code) text = `\`${text}\``;
    if (ann?.bold) text = `**${text}**`;
    if (ann?.italic) text = `*${text}*`;
    if (ann?.strikethrough) text = `~~${text}~~`;
    if (item.href) text = `[${text}](${item.href})`;

    return text;
  }).join('');
}

export function blocksToMarkdown(blocks: NotionBlock[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    const data = block[block.type] as Record<string, unknown> | undefined;
    if (!data) continue;

    const richText = (data.rich_text || []) as RichTextItem[];
    const text = richTextToMarkdown(richText);

    switch (block.type) {
      case 'paragraph':
        lines.push(text);
        lines.push('');
        break;

      case 'heading_1':
        lines.push(`# ${text}`);
        lines.push('');
        break;

      case 'heading_2':
        lines.push(`## ${text}`);
        lines.push('');
        break;

      case 'heading_3':
        lines.push(`### ${text}`);
        lines.push('');
        break;

      case 'bulleted_list_item':
        lines.push(`- ${text}`);
        break;

      case 'numbered_list_item':
        lines.push(`1. ${text}`);
        break;

      case 'to_do': {
        const checked = (data as Record<string, unknown>).checked ? 'x' : ' ';
        lines.push(`- [${checked}] ${text}`);
        break;
      }

      case 'toggle':
        lines.push(`<details><summary>${text}</summary>`);
        lines.push('');
        break;

      case 'code': {
        const language = ((data as Record<string, unknown>).language as string) || '';
        lines.push(`\`\`\`${language}`);
        lines.push(text);
        lines.push('```');
        lines.push('');
        break;
      }

      case 'quote':
        lines.push(`> ${text}`);
        lines.push('');
        break;

      case 'divider':
        lines.push('---');
        lines.push('');
        break;

      case 'callout': {
        const icon = (data as Record<string, unknown>).icon as { emoji?: string } | undefined;
        const emoji = icon?.emoji || '💡';
        lines.push(`> ${emoji} ${text}`);
        lines.push('');
        break;
      }

      case 'image': {
        const imgData = data as Record<string, unknown>;
        const file = (imgData.file || imgData.external) as { url: string } | undefined;
        const caption = (imgData.caption || []) as RichTextItem[];
        const captionText = richTextToMarkdown(caption);
        if (file) {
          lines.push(`![${captionText}](${file.url})`);
          lines.push('');
        }
        break;
      }

      case 'bookmark': {
        const url = (data as Record<string, unknown>).url as string;
        const caption = (data as Record<string, unknown>).caption as RichTextItem[] | undefined;
        const captionText = caption ? richTextToMarkdown(caption) : url;
        lines.push(`[${captionText}](${url})`);
        lines.push('');
        break;
      }

      case 'table': {
        // Tables need children blocks (rows)
        lines.push('<!-- table -->');
        break;
      }

      case 'equation':
        lines.push(`$$${text}$$`);
        lines.push('');
        break;

      default:
        if (text) {
          lines.push(text);
          lines.push('');
        }
        break;
    }
  }

  return lines.join('\n');
}

export function markdownToNotionBlocks(markdown: string): unknown[] {
  const lines = markdown.split('\n');
  const blocks: unknown[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      blocks.push({
        object: 'block',
        type: `heading_${level}`,
        [`heading_${level}`]: {
          rich_text: [{ type: 'text', text: { content: text } }],
        },
      });
      i++;
      continue;
    }

    // Divider
    if (line.match(/^---+$/)) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {},
      });
      i++;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'plain text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: codeLines.join('\n') } }],
          language,
        },
      });
      continue;
    }

    // Quote
    if (line.startsWith('> ')) {
      const text = line.slice(2);
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{ type: 'text', text: { content: text } }],
        },
      });
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^[-*]\s/)) {
      const text = line.replace(/^[-*]\s/, '');
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: text } }],
        },
      });
      i++;
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, '');
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [{ type: 'text', text: { content: text } }],
        },
      });
      i++;
      continue;
    }

    // To-do
    if (line.match(/^-\s\[[ x]\]\s/)) {
      const checked = line.includes('[x]');
      const text = line.replace(/^-\s\[[ x]\]\s/, '');
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: text } }],
          checked,
        },
      });
      i++;
      continue;
    }

    // Default: paragraph
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: line } }],
      },
    });
    i++;
  }

  return blocks;
}
