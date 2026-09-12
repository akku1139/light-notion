import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCachedPages, setCachedPages, clearCache } from './cache';
import type { NotionPage } from './notion';

describe('cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should cache and retrieve pages', () => {
    const pages = [
      {
        id: '1',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        parent: { type: 'workspace', workspace: true },
        archived: false,
        url: 'https://notion.so/1',
        public_url: null,
        icon: null,
        cover: null,
        properties: {
          title: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Test Page', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Test Page',
                href: null,
              },
            ],
          },
        },
        object: 'page',
      },
    ] as unknown as NotionPage[];

    setCachedPages('test-db', pages);
    const cached = getCachedPages('test-db');
    
    expect(cached).not.toBeNull();
    expect(cached?.length).toBe(1);
    expect(cached?.[0].id).toBe('1');
  });

  it('should return null for expired cache', () => {
    const pages: NotionPage[] = [];
    
    // Set cache
    setCachedPages('test-db', pages);
    
    // Mock Date.now to simulate expired cache (6 minutes later)
    const originalDateNow = Date.now;
    Date.now = vi.fn(() => originalDateNow() + 6 * 60 * 1000);
    
    const cached = getCachedPages('test-db');
    expect(cached).toBeNull();
    
    // Restore Date.now
    Date.now = originalDateNow;
  });

  it('should clear cache for specific database', () => {
    const pages: NotionPage[] = [];
    
    setCachedPages('db1', pages);
    setCachedPages('db2', pages);
    
    clearCache('db1');
    
    expect(getCachedPages('db1')).toBeNull();
    expect(getCachedPages('db2')).not.toBeNull();
  });

  it('should clear all cache', () => {
    const pages: NotionPage[] = [];
    
    setCachedPages('db1', pages);
    setCachedPages('db2', pages);
    
    clearCache();
    
    expect(getCachedPages('db1')).toBeNull();
    expect(getCachedPages('db2')).toBeNull();
  });

  it('should return null for non-existent cache', () => {
    const cached = getCachedPages('non-existent');
    expect(cached).toBeNull();
  });
});
