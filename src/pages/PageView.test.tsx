import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PageView from './PageView';
import * as notionModule from '../lib/notion';

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('PageView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = mockMatchMedia;
    localStorage.clear();
  });

  const mockPage = {
    id: 'test-page-id',
    object: 'page' as const,
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-01T00:00:00.000Z',
    parent: { type: 'workspace' as const, workspace: true },
    archived: false,
    url: 'https://notion.so/test-page-id',
    public_url: null,
    icon: { type: 'emoji' as const, emoji: '📄' },
    cover: null,
    properties: {
      title: {
        id: 'title',
        type: 'title' as const,
        title: [
          {
            type: 'text' as const,
            text: { content: 'Test Page', link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default' as const,
            },
            plain_text: 'Test Page',
            href: null,
          },
        ],
      },
    },
  };

  const mockBlocks = {
    results: [
      {
        id: 'block-1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Test content', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Test content',
              href: null,
            },
          ],
          color: 'default',
        },
      },
    ],
    has_more: false,
    next_cursor: null,
  };

  const renderWithRouter = (pageId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/page/${pageId}`]}>
        <Routes>
          <Route path="/page/:id" element={<PageView />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should display loading state initially', () => {
    vi.spyOn(notionModule, 'getPage').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(notionModule, 'getBlocks').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([]);

    renderWithRouter('test-page-id');

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should display error state when loading fails', async () => {
    vi.spyOn(notionModule, 'getPage').mockRejectedValue(new Error('Failed to load'));
    vi.spyOn(notionModule, 'getBlocks').mockRejectedValue(new Error('Failed to load'));
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([]);

    renderWithRouter('test-page-id');

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeTruthy();
    });
  });

  it('should display page content after loading', async () => {
    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockPage as any);
    vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([]);

    renderWithRouter('test-page-id');

    await waitFor(() => {
      expect(screen.getByText('Test Page')).toBeTruthy();
      expect(screen.getByText('Test content')).toBeTruthy();
    });
  });

  it('should display page icon when present', async () => {
    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockPage as any);
    vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([]);

    renderWithRouter('test-page-id');

    await waitFor(() => {
      expect(screen.getByText('📄')).toBeTruthy();
    });
  });

  it('should display navigation links', async () => {
    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockPage as any);
    vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([]);

    renderWithRouter('test-page-id');

    await waitFor(() => {
      expect(screen.getByText('Back to list')).toBeTruthy();
      expect(screen.getByText('Open in Notion')).toBeTruthy();
      expect(screen.getByText('Edit')).toBeTruthy();
    });
  });

  it('should display child page count when child pages exist', async () => {
    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockPage as any);
    vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([
      { id: 'child-1' },
      { id: 'child-2' },
    ] as any);

    renderWithRouter('test-page-id');

    await waitFor(() => {
      expect(screen.getByText('2')).toBeTruthy();
    });
  });

  it('should display emoji button', async () => {
    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockPage as any);
    vi.spyOn(notionModule, 'getBlocks').mockResolvedValue(mockBlocks as any);
    vi.spyOn(notionModule, 'getChildPages').mockResolvedValue([]);

    renderWithRouter('test-page-id');

    await waitFor(() => {
      expect(screen.getByTitle('Change emoji')).toBeTruthy();
    });
  });
});
