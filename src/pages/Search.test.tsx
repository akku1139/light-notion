import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from './Search';
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

describe('Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = mockMatchMedia;
    localStorage.clear();
  });

  const mockSearchResults = {
    results: [
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
                text: { content: 'Search Result 1', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default' as const,
                },
                plain_text: 'Search Result 1',
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
        parent: { type: 'workspace' as const, workspace: true },
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
                text: { content: 'Search Result 2', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default' as const,
                },
                plain_text: 'Search Result 2',
                href: null,
              },
            ],
          },
        },
      },
    ],
    has_more: false,
    next_cursor: null,
  };

  it('should display search page', () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('should display search input', () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Search pages...')).toBeTruthy();
  });

  it('should display search results after searching', async () => {
    vi.spyOn(notionModule, 'searchPages').mockResolvedValue(mockSearchResults as any);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Search Result 1')).toBeTruthy();
      expect(screen.getByText('Search Result 2')).toBeTruthy();
    });
  });

  it('should display "No pages found" when no results', async () => {
    vi.spyOn(notionModule, 'searchPages').mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('No pages found. Try a different search term.')).toBeTruthy();
    });
  });

  it('should display loading state while searching', async () => {
    vi.spyOn(notionModule, 'searchPages').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form!);

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should display search result count', async () => {
    vi.spyOn(notionModule, 'searchPages').mockResolvedValue(mockSearchResults as any);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/2 results found/)).toBeTruthy();
    });
  });

  it('should navigate to page when clicking search result', async () => {
    vi.spyOn(notionModule, 'searchPages').mockResolvedValue(mockSearchResults as any);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      const resultLink = screen.getByText('Search Result 1');
      const anchorElement = resultLink.closest('a');
      expect(anchorElement?.getAttribute('href')).toBe('/page/page-1');
    });
  });

  it('should display page icons in search results', async () => {
    vi.spyOn(notionModule, 'searchPages').mockResolvedValue(mockSearchResults as any);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('📄')).toBeTruthy();
      expect(screen.getByText('📝')).toBeTruthy();
    });
  });
});
