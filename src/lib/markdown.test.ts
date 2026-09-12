import { describe, it, expect } from 'vitest';
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
});
