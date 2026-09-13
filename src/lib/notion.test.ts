import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPageTitle, getPageExcerpt, getChildPages, getBlocks } from './notion';
import type { NotionPage } from './notion';

describe('notion helpers', () => {
  describe('getPageTitle', () => {
    it('should extract title from page properties', () => {
      const page = {
        id: 'test-id',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Test Page Title', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Test Page Title',
                href: null,
              },
            ],
          },
        },
      } as unknown as NotionPage;

      expect(getPageTitle(page)).toBe('Test Page Title');
    });

    it('should return "Untitled" when no title property exists', () => {
      const page = {
        id: 'test-id',
        properties: {},
      } as unknown as NotionPage;

      expect(getPageTitle(page)).toBe('Untitled');
    });

    it('should return "Untitled" when title array is empty', () => {
      const page = {
        id: 'test-id',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [],
          },
        },
      } as unknown as NotionPage;

      expect(getPageTitle(page)).toBe('Untitled');
    });

    it('should concatenate multiple title text items', () => {
      const page = {
        id: 'test-id',
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Part 1 ', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Part 1 ',
                href: null,
              },
              {
                type: 'text',
                text: { content: 'Part 2', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Part 2',
                href: null,
              },
            ],
          },
        },
      } as unknown as NotionPage;

      expect(getPageTitle(page)).toBe('Part 1 Part 2');
    });
  });

  describe('getPageExcerpt', () => {
    it('should extract excerpt from rich_text property', () => {
      const page = {
        id: 'test-id',
        properties: {
          Description: {
            id: 'description',
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: { content: 'This is a description', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'This is a description',
                href: null,
              },
            ],
          },
        },
      } as unknown as NotionPage;

      expect(getPageExcerpt(page)).toBe('This is a description');
    });

    it('should return empty string when no rich_text property exists', () => {
      const page = {
        id: 'test-id',
        properties: {},
      } as NotionPage;

      expect(getPageExcerpt(page)).toBe('');
    });

    it('should return empty string when rich_text array is empty', () => {
      const page = {
        id: 'test-id',
        properties: {
          Description: {
            id: 'description',
            type: 'rich_text',
            rich_text: [],
          },
        },
      } as unknown as NotionPage;

      expect(getPageExcerpt(page)).toBe('');
    });
  });

  describe('getChildPages', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Set a mock token
      localStorage.setItem('notion_api_token', 'test-token');
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should extract child pages from blocks', async () => {
      const mockBlocks = {
        results: [
          {
            id: 'block-1',
            type: 'child_page',
            child_page: { title: 'Child Page 1' },
            icon: { type: 'emoji', emoji: '📄' },
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            parent: { type: 'page_id', page_id: 'parent-id' },
          },
          {
            id: 'block-2',
            type: 'paragraph',
            paragraph: { rich_text: [] },
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            parent: { type: 'page_id', page_id: 'parent-id' },
          },
          {
            id: 'block-3',
            type: 'child_page',
            child_page: { title: 'Child Page 2' },
            icon: { type: 'emoji', emoji: '📝' },
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            parent: { type: 'page_id', page_id: 'parent-id' },
          },
        ],
        has_more: false,
        next_cursor: null,
      } as any;

      const notionModule = await import('./notion');
      vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);

      const result = await getChildPages('parent-id');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('block-1');
      expect((result[0].properties as any).title.title[0].plain_text).toBe('Child Page 1');
      expect(result[0].icon).toEqual({ type: 'emoji', emoji: '📄' });
      expect(result[1].id).toBe('block-3');
      expect((result[1].properties as any).title.title[0].plain_text).toBe('Child Page 2');
      expect(result[1].icon).toEqual({ type: 'emoji', emoji: '📝' });
    });

    it('should return empty array when no child pages exist', async () => {
      const mockBlocks = {
        results: [
          {
            id: 'block-1',
            type: 'paragraph',
            paragraph: { rich_text: [] },
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            parent: { type: 'page_id', page_id: 'parent-id' },
          },
        ],
        has_more: false,
        next_cursor: null,
      } as any;

      const notionModule = await import('./notion');
      vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);

      const result = await getChildPages('parent-id');
      expect(result).toHaveLength(0);
    });

    it('should handle child pages without icon', async () => {
      const mockBlocks = {
        results: [
          {
            id: 'block-1',
            type: 'child_page',
            child_page: { title: 'Child Page' },
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            parent: { type: 'page_id', page_id: 'parent-id' },
          },
        ],
        has_more: false,
        next_cursor: null,
      } as any;

      vi.spyOn(await import('./notion'), 'getBlocks').mockResolvedValue(mockBlocks as any);

      const result = await getChildPages('parent-id');
      expect(result).toHaveLength(1);
      expect(result[0].icon).toBeNull();
    });
  });
});
