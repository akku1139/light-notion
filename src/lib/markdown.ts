import type { NotionBlock } from './notion';

interface RichTextItem {
  plain_text: string;
  type?: string;
  equation?: {
    expression: string;
  };
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

// Escape special characters in markdown (outside code blocks)
function escapeMarkdown(text: string): string {
  return text.replace(/([\\*~`$[\]<>{}|^])/g, '\\$1');
}

function richTextToMarkdown(items: RichTextItem[]): string {
  return items.map(item => {
    // Handle inline equations
    if (item.type === 'equation' && item.equation) {
      return `$${item.equation.expression}$`;
    }

    let text = item.plain_text;
    if (!text) return '';

    const ann = item.annotations;
    
    // Apply formatting in correct order
    if (ann?.code) {
      text = `\`${text}\``;
    } else {
      // Escape special characters only outside code blocks
      text = escapeMarkdown(text);
    }
    
    if (ann?.bold) text = `**${text}**`;
    if (ann?.italic) text = `*${text}*`;
    if (ann?.strikethrough) text = `~~${text}~~`;
    
    // Handle underline with span tag
    if (ann?.underline) {
      text = `<span underline="true">${text}</span>`;
    }
    
    // Handle color with span tag
    if (ann?.color && ann.color !== 'default') {
      text = `<span color="${ann.color}">${text}</span>`;
    }
    
    if (item.href) text = `[${text}](${item.href})`;

    return text;
  }).join('');
}

import { getBlocks } from './notion';

// Resolve reference-style links from Notion
// Notion format: [[1]](1) in text, [[1]](1): [Title](URL) in definitions
// Standard format: [1] in text, [1]: URL in definitions
export function resolveReferenceLinks(text: string): string {
  const refLinks: Record<string, string> = {};
  
  // Step 1: Normalize [[N]](N) to [N]
  let normalized = text.replace(/\[\[(\d+)\]\]\(\d+\)/g, '[$1]');
  
  // Step 2: Match reference definitions
  // Formats:
  // - [N]: [Title](URL)
  // - [N]: URL
  // - [N]: title: URL
  const refDefRegex = /^\[(\d+)\]:\s+(.+)$/gm;
  let match;
  
  while ((match = refDefRegex.exec(normalized)) !== null) {
    const ref = match[1];
    const content = match[2].trim();
    let url = '';
    
    // Try to extract URL from [Title](URL) format
    const markdownLinkMatch = content.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (markdownLinkMatch) {
      url = markdownLinkMatch[2];
    } else {
      // Try title: URL format
      const titleUrlMatch = content.match(/^(.+?):\s+(https?:\/\/\S+)$/);
      if (titleUrlMatch) {
        url = titleUrlMatch[2];
      } else if (content.match(/^https?:\/\//)) {
        // Direct URL
        url = content;
      }
    }
    
    if (url) {
      refLinks[ref] = url;
    }
  }
  
  // Step 3: Remove reference definitions
  normalized = normalized.replace(refDefRegex, '').trim();
  
  // Step 4: Replace [text][ref] with [text](url)
  for (const [ref, url] of Object.entries(refLinks)) {
    // Match [text][ref] pattern
    const refLinkRegex = new RegExp(`\\[([^\\]]+)\\]\\[${ref}\\]`, 'g');
    normalized = normalized.replace(refLinkRegex, `[$1](${url})`);
    
    // Also handle standalone [ref] pattern
    const standaloneRefRegex = new RegExp(`\\[${ref}\\](?!\\[|\\()`, 'g');
    normalized = normalized.replace(standaloneRefRegex, `[${ref}](${url})`);
  }
  
  return normalized;
}

export async function blocksToMarkdown(blocks: NotionBlock[]): Promise<string> {
  const lines: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!('type' in block)) continue;
    
    const blockType = block.type;
    const data = (block as Record<string, unknown>)[blockType] as Record<string, unknown> | undefined;
    if (!data) continue;

    const richText = (data.rich_text || []) as RichTextItem[];
    let text = richTextToMarkdown(richText);
    
    // Get block color if present
    const blockColor = (data as Record<string, unknown>).color as string | undefined;
    const colorAttr = blockColor && blockColor !== 'default' ? ` {color="${blockColor}"}` : '';

    // Check if next block is a list item
    const nextBlock = i + 1 < blocks.length ? blocks[i + 1] : null;
    const nextBlockType = nextBlock && 'type' in nextBlock ? nextBlock.type : null;
    const isNextBlockListItem = nextBlockType === 'bulleted_list_item' || 
                                nextBlockType === 'numbered_list_item' || 
                                nextBlockType === 'to_do';

    switch (blockType) {
      case 'paragraph':
        if (!text) {
          lines.push('<empty-block/>');
        } else {
          lines.push(text + colorAttr);
        }
        lines.push('');
        break;

      case 'heading_1':
        lines.push(`# ${text}${colorAttr}`);
        lines.push('');
        break;

      case 'heading_2':
        lines.push(`## ${text}${colorAttr}`);
        lines.push('');
        break;

      case 'heading_3':
        lines.push(`### ${text}${colorAttr}`);
        lines.push('');
        break;

      case 'bulleted_list_item':
        lines.push(`- ${text}${colorAttr}`);
        // Add blank line after list if next block is not a list item
        if (!isNextBlockListItem) {
          lines.push('');
        }
        break;

      case 'numbered_list_item':
        lines.push(`1. ${text}${colorAttr}`);
        // Add blank line after list if next block is not a list item
        if (!isNextBlockListItem) {
          lines.push('');
        }
        break;

      case 'to_do': {
        const checked = (data as Record<string, unknown>).checked ? 'x' : ' ';
        lines.push(`- [${checked}] ${text}${colorAttr}`);
        // Add blank line after list if next block is not a list item
        if (!isNextBlockListItem) {
          lines.push('');
        }
        break;
      }

      case 'toggle':
        lines.push(`<details><summary>${text}</summary>`);
        lines.push('');
        break;

      case 'code': {
        const language = ((data as Record<string, unknown>).language as string) || '';
        // For code blocks, use raw text without escaping
        const codeText = richText.map(item => item.plain_text).join('');
        lines.push(`\`\`\`${language}`);
        lines.push(codeText);
        lines.push('```');
        lines.push('');
        break;
      }

      case 'quote':
        // Replace newlines with <br> tags for multi-line quotes
        const quoteText = text.replace(/\n/g, '<br>');
        lines.push(`> ${quoteText}${colorAttr}`);
        lines.push('');
        break;

      case 'divider':
        lines.push('---');
        lines.push('');
        break;

      case 'callout': {
        const icon = (data as Record<string, unknown>).icon as { emoji?: string } | undefined;
        const emoji = icon?.emoji || '💡';
        lines.push(`<callout icon="${emoji}"${colorAttr ? colorAttr.replace(' {', ' ').replace('}', '"}').replace('color=', 'color="') : ''}>`);
        lines.push(`\t${text}`);
        lines.push('</callout>');
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
        const blockId = (block as Record<string, unknown>).id as string;
        if (blockId) {
          try {
            const childrenData = await getBlocks(blockId);
            const rows = childrenData.results;
            const hasHeader = (data as Record<string, unknown>).has_column_header as boolean;
            const hasColumnHeader = (data as Record<string, unknown>).has_column_header as boolean;
            
            if (rows.length > 0) {
              // Convert table rows to HTML format
              const tableRows: string[][] = [];
              
              for (const row of rows) {
                if (!('type' in row) || row.type !== 'table_row') continue;
                const rowData = (row as Record<string, unknown>).table_row as Record<string, unknown> | undefined;
                if (!rowData) continue;
                
                const cells = (rowData.cells || []) as RichTextItem[][];
                const cellTexts = cells.map(cell => richTextToMarkdown(cell));
                tableRows.push(cellTexts);
              }
              
              if (tableRows.length > 0) {
                // Generate HTML table
                lines.push(`<table${hasHeader ? ' header-row="true"' : ''}${hasColumnHeader ? ' header-column="true"' : ''}>`);
                
                // Render rows
                for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
                  const row = tableRows[rowIndex];
                  lines.push('\t<tr>');
                  for (const cell of row) {
                    lines.push(`\t\t<td>${cell}</td>`);
                  }
                  lines.push('\t</tr>');
                }
                
                lines.push('</table>');
                lines.push('');
              }
            }
          } catch (err) {
            console.error('Failed to load table children:', err);
            lines.push('<!-- table (failed to load) -->');
          }
        }
        break;
      }

      case 'equation': {
        // Block-level equation - extract from equation property
        const equationData = (data as Record<string, unknown>).expression as string | undefined;
        const equationText = equationData || text;
        // Remove newlines and extra spaces for proper KaTeX rendering
        const cleanEquation = equationText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        lines.push(`$$${cleanEquation}$$`);
        lines.push('');
        break;
      }

      default:
        if (text) {
          lines.push(text);
          lines.push('');
        }
        break;
    }
  }

  let result = lines.join('\n');

  // Resolve reference-style links
  result = resolveReferenceLinks(result);

  return result;
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
