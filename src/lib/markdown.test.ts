import { describe, it, expect, vi } from 'vitest';
import { blocksToMarkdown, resolveReferenceLinks } from './markdown';
import type { NotionBlock } from './notion';

describe('blocksToMarkdown', () => {
  it('should convert paragraph block to markdown', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Hello world',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('Hello world');
  });

  it('should convert heading blocks to markdown', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'heading_1',
        has_children: false,
        heading_1: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Heading 1',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
          is_toggleable: false,
        },
      } as NotionBlock,
      {
        id: '2',
        type: 'heading_2',
        has_children: false,
        heading_2: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Heading 2',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
          is_toggleable: false,
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('# Heading 1');
    expect(markdown).toContain('## Heading 2');
  });

  it('should convert code block to markdown', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'code',
        has_children: false,
        code: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'const x = 1;',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          language: 'javascript',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('```javascript');
    expect(markdown).toContain('const x = 1;');
    expect(markdown).toContain('```');
  });

  it('should convert equation block to markdown', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'equation',
        has_children: false,
        equation: {
          expression: 'E = mc^2',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('$$E = mc^2$$');
  });

  it('should convert list items to markdown', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Item 1',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
      {
        id: '2',
        type: 'numbered_list_item',
        has_children: false,
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Item 2',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('- Item 1');
    expect(markdown).toContain('1. Item 2');
  });

  it('should add blank line after list when followed by paragraph', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'List item 1',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
      {
        id: '2',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Paragraph after list',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    // Should have blank line between list and paragraph
    expect(markdown).toContain('- List item 1\n\nParagraph after list');
  });

  it('should not add blank line between consecutive list items', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'List item 1',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
      {
        id: '2',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'List item 2',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    // Should not have blank line between list items
    expect(markdown).toContain('- List item 1\n- List item 2');
    expect(markdown).not.toContain('- List item 1\n\n- List item 2');
  });

  it('should handle mixed list types correctly', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Bullet item',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
      {
        id: '2',
        type: 'numbered_list_item',
        has_children: false,
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Numbered item',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
      {
        id: '3',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Final paragraph',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'default',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    // Should have blank line only after the last list item
    expect(markdown).toContain('- Bullet item\n1. Numbered item\n\nFinal paragraph');
  });

  it('should escape special characters in text', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Text with *special* characters: \\, $, [, ]',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('\\*special\\*');
    expect(markdown).toContain('\\\\');
    expect(markdown).toContain('\\$');
    expect(markdown).toContain('\\[');
    expect(markdown).toContain('\\]');
  });

  it('should not escape characters inside code blocks', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'code',
        has_children: false,
        code: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'const x = *special*; // no escape',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          language: 'javascript',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('const x = *special*;');
    expect(markdown).not.toContain('\\*special\\*');
  });

  it('should render underline with span tag', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'underlined text',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: true,
                code: false,
                color: 'default',
              },
            },
          ],
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('<span underline="true">underlined text</span>');
  });

  it('should render colored text with span tag', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'red text',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'red',
              },
            },
          ],
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('<span color="red">red text</span>');
  });

  it('should add color attribute to blocks', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Blue paragraph',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          color: 'blue',
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('Blue paragraph {color="blue"}');
  });

  it('should render empty paragraph as empty-block tag', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [],
        },
      } as unknown as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('<empty-block/>');
  });

  it('should render callout with callout tag', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'callout',
        has_children: false,
        callout: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Important note',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
          icon: { type: 'emoji', emoji: '💡' },
          color: 'yellow_bg',
        },
      } as unknown as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('<callout icon="💡"');
    expect(markdown).toContain('\tImportant note');
    expect(markdown).toContain('</callout>');
  });

  it('should render multi-line quote with br tags', async () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'quote',
        has_children: false,
        quote: {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Line 1\nLine 2\nLine 3',
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
            },
          ],
        },
      } as NotionBlock,
    ];

    const markdown = await blocksToMarkdown(blocks);
    expect(markdown).toContain('> Line 1<br>Line 2<br>Line 3');
  });
});

describe('resolveReferenceLinks', () => {
  it('should resolve reference-style links', () => {
    const text = 'Click [here][1]\n\n[1]: https://example.com';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toContain('[here](https://example.com)');
    expect(resolved).not.toContain('[1]:');
  });

  it('should handle multiple references', () => {
    const text = 'See [link1][1] and [link2][2]\n\n[1]: https://example1.com\n[2]: https://example2.com';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toContain('[link1](https://example1.com)');
    expect(resolved).toContain('[link2](https://example2.com)');
  });

  it('should handle text without references', () => {
    const text = 'This is plain text without any references';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toBe(text);
  });

  it('should handle Notion format [[1]](1)', () => {
    const text = 'See [[1]](1) for details\n\n[[1]](1): [Title](https://example.com)';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toContain('[1](https://example.com)');
    expect(resolved).not.toContain('[[1]]');
  });

  it('should handle reference with title in URL format', () => {
    const text = 'See [1]\n\n[1]: title: https://example.com';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toContain('[1](https://example.com)');
  });

  it('should handle empty text', () => {
    const text = '';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toBe('');
  });

  it('should preserve existing inline links', () => {
    const text = 'Click [here](https://example.com) and see [1]\n\n[1]: https://other.com';
    const resolved = resolveReferenceLinks(text);
    
    expect(resolved).toContain('[here](https://example.com)');
    expect(resolved).toContain('[1](https://other.com)');
  });
});
