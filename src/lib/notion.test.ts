import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPageTitle, getPageExcerpt, getChildPages, getBlocks } from './notion';
import type { NotionPage } from './notion';

vi.mock('./notion', async () => {
  const actual = await vi.importActual<typeof import('./notion')>('./notion');
  return {
    ...actual,
    getBlocks: vi.fn(),
  };
});

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

  // Note: getChildPages tests are covered in ChildPages.test.tsx
  // Testing the integration at the component level is more reliable
});
