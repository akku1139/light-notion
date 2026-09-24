import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageList from './PageList';
import * as notionModule from '../lib/notion';
import * as cacheModule from '../lib/cache';
import * as authModule from '../lib/auth';
import { PageTreeProvider } from '../contexts/PageTreeContext';

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

describe('PageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = mockMatchMedia;
    localStorage.clear();
  });

  const mockPages = [
    {
      id: 'page-1',
      object: 'page' as const,
      created_time: '2024-01-01T00:00:00.000Z',
      last_edited_time: '2024-01-01T00:00:00.000Z',
      parent: { type: 'workspace' as const, workspace: true },
      archived: false,
      url: 'https://notion.so/page-1',
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
              text: { content: 'Page 1', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default' as const,
              },
              plain_text: 'Page 1',
              href: null,
            },
          ],
        },
      },
    },
    {
      id: 'page-2',
      object: 'page' as const,
      created_time: '2024-01-02T00:00:00.000Z',
      last_edited_time: '2024-01-02T00:00:00.000Z',
      parent: { type: 'page_id' as const, page_id: 'page-1' },
      archived: false,
      url: 'https://notion.so/page-2',
      public_url: null,
      icon: { type: 'emoji' as const, emoji: '📝' },
      cover: null,
      properties: {
        title: {
          id: 'title',
          type: 'title' as const,
          title: [
            {
              type: 'text' as const,
              text: { content: 'Page 2', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default' as const,
              },
              plain_text: 'Page 2',
              href: null,
            },
          ],
        },
      },
    },
  ];

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <PageTreeProvider>
          {ui}
        </PageTreeProvider>
      </MemoryRouter>
    );
  };

  it('should display pages after loading', async () => {
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');
    vi.spyOn(cacheModule, 'getCachedPages').mockReturnValue(null);
    vi.spyOn(notionModule, 'queryDatabase').mockResolvedValue({
      results: mockPages as any,
      has_more: false,
      next_cursor: null,
    });

    renderWithProviders(<PageList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    });
  });

  it('should expand child pages when clicking expand button', async () => {
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');
    vi.spyOn(cacheModule, 'getCachedPages').mockReturnValue(null);
    vi.spyOn(notionModule, 'queryDatabase').mockResolvedValue({
      results: mockPages as any,
      has_more: false,
      next_cursor: null,
    });

    renderWithProviders(<PageList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    });

    // Find the expand button (button with chevron-right class)
    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons.find(btn => btn.querySelector('.lucide-chevron-right'));
    expect(expandButton).toBeTruthy();
    fireEvent.click(expandButton!);

    // Child page should be visible
    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeTruthy();
    });
  });

  it('should collapse child pages when clicking expand button again', async () => {
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');
    vi.spyOn(cacheModule, 'getCachedPages').mockReturnValue(null);
    vi.spyOn(notionModule, 'queryDatabase').mockResolvedValue({
      results: mockPages as any,
      has_more: false,
      next_cursor: null,
    });

    renderWithProviders(<PageList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    });

    // Find the expand button
    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons.find(btn => btn.querySelector('.lucide-chevron-right'));
    expect(expandButton).toBeTruthy();

    // Expand
    fireEvent.click(expandButton!);

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeTruthy();
    });

    // Collapse
    fireEvent.click(expandButton!);

    await waitFor(() => {
      expect(screen.queryByText('Page 2')).toBeNull();
    });
  });

  it('should load more pages when clicking Load more button', async () => {
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');
    vi.spyOn(cacheModule, 'getCachedPages').mockReturnValue(null);
    
    const mockQueryDatabase = vi.spyOn(notionModule, 'queryDatabase')
      .mockResolvedValueOnce({
        results: [{ ...mockPages[0], parent: { type: 'workspace' as const, workspace: true } }] as any,
        has_more: true,
        next_cursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        results: [{ ...mockPages[1], parent: { type: 'workspace' as const, workspace: true } }] as any,
        has_more: false,
        next_cursor: null,
      });

    renderWithProviders(<PageList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    });

    // Click Load more button
    const loadMoreButton = await screen.findByText('Load more');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeTruthy();
    });

    // Verify queryDatabase was called twice
    expect(mockQueryDatabase).toHaveBeenCalledTimes(2);
  });

  it('should not freeze when rapidly clicking expand button', async () => {
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');
    vi.spyOn(cacheModule, 'getCachedPages').mockReturnValue(null);
    vi.spyOn(notionModule, 'queryDatabase').mockResolvedValue({
      results: mockPages as any,
      has_more: false,
      next_cursor: null,
    });

    renderWithProviders(<PageList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    });

    // Find the expand button
    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons.find(btn => btn.querySelector('.lucide-chevron-right'));
    expect(expandButton).toBeTruthy();

    // Rapidly click expand button multiple times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(expandButton!);
    }

    // Should not freeze - just verify the component is still responsive
    // The child page may or may not be visible depending on the final state
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('should not freeze when rapidly clicking Load more button', async () => {
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');
    vi.spyOn(cacheModule, 'getCachedPages').mockReturnValue(null);
    
    const mockQueryDatabase = vi.spyOn(notionModule, 'queryDatabase')
      .mockResolvedValue({
        results: mockPages as any,
        has_more: true,
        next_cursor: 'cursor-1',
      });

    renderWithProviders(<PageList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeTruthy();
    });

    // Rapidly click Load more button multiple times
    const loadMoreButton = await screen.findByText('Load more');
    for (let i = 0; i < 10; i++) {
      fireEvent.click(loadMoreButton);
    }

    // Should not freeze
    await waitFor(() => {
      expect(mockQueryDatabase).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});
