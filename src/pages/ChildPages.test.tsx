import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import ChildPages from './ChildPages';
import * as notionModule from '../lib/notion';
import { PageTreeProvider, usePageTree, type TreeNode } from '../contexts/PageTreeContext';

describe('ChildPages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (pageId: string, initialTree: TreeNode[] = []) => {
    const TestWrapper = () => {
      const { setTree } = usePageTree();
      
      useEffect(() => {
        setTree(initialTree);
      }, [initialTree, setTree]);
      
      return (
        <MemoryRouter initialEntries={[`/pages/${pageId}`]}>
          <Routes>
            <Route path="/pages/:id" element={<ChildPages />} />
          </Routes>
        </MemoryRouter>
      );
    };
    
    return render(
      <PageTreeProvider>
        <TestWrapper />
      </PageTreeProvider>
    );
  };

  it('should display loading state initially', () => {
    vi.spyOn(notionModule, 'getPage').mockImplementation(() => new Promise(() => {}));

    renderWithRouter('parent-id');

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should display error state when loading fails', async () => {
    vi.spyOn(notionModule, 'getPage').mockRejectedValue(new Error('Failed to load'));

    renderWithRouter('parent-id');

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeTruthy();
    });
  });

  it('should display child pages list', async () => {
    const mockParentPage = {
      id: 'parent-id',
      parent: { type: 'workspace', workspace: true },
      properties: {
        title: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: 'Parent Page', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Parent Page',
              href: null,
            },
          ],
        },
      },
    } as any;

    const mockChildPages = [
      {
        id: 'child-1',
        parent: { type: 'page_id', page_id: 'parent-id' },
        icon: { type: 'emoji', emoji: '📄' },
        properties: {
          title: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Child Page 1', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Child Page 1',
                href: null,
              },
            ],
          },
        },
        last_edited_time: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'child-2',
        parent: { type: 'page_id', page_id: 'parent-id' },
        icon: { type: 'emoji', emoji: '📝' },
        properties: {
          title: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Child Page 2', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Child Page 2',
                href: null,
              },
            ],
          },
        },
        last_edited_time: '2024-01-02T00:00:00.000Z',
      },
    ] as any;

    const mockTree: TreeNode[] = [
      {
        page: mockParentPage,
        children: mockChildPages.map((child: any) => ({ page: child, children: [] })),
      },
    ];

    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockParentPage);

    renderWithRouter('parent-id', mockTree);

    await waitFor(() => {
      expect(screen.getByText('Child pages of "Parent Page"')).toBeTruthy();
      expect(screen.getByText('2 child pages')).toBeTruthy();
      expect(screen.getByText('Child Page 1')).toBeTruthy();
      expect(screen.getByText('Child Page 2')).toBeTruthy();
    });

    // Check if emoji icons are displayed
    expect(screen.getByText('📄')).toBeTruthy();
    expect(screen.getByText('📝')).toBeTruthy();
  });

  it('should display empty state when no child pages exist', async () => {
    const mockParentPage = {
      id: 'parent-id',
      properties: {
        title: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: 'Parent Page', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Parent Page',
              href: null,
            },
          ],
        },
      },
    } as any;

    const mockTree: TreeNode[] = [
      {
        page: mockParentPage,
        children: [],
      },
    ];

    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockParentPage);

    renderWithRouter('parent-id', mockTree);

    await waitFor(() => {
      expect(screen.getByText('No child pages found.')).toBeTruthy();
    });
  });

  it('should display file icon when page has no icon', async () => {
    const mockParentPage = {
      id: 'parent-id',
      parent: { type: 'workspace', workspace: true },
      properties: {
        title: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: 'Parent Page', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Parent Page',
              href: null,
            },
          ],
        },
      },
    } as any;

    const mockChildPages = [
      {
        id: 'child-1',
        parent: { type: 'page_id', page_id: 'parent-id' },
        icon: null,
        properties: {
          title: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Child Page', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Child Page',
                href: null,
              },
            ],
          },
        },
        last_edited_time: '2024-01-01T00:00:00.000Z',
      },
    ] as any;

    const mockTree: TreeNode[] = [
      {
        page: mockParentPage,
        children: mockChildPages.map((child: any) => ({ page: child, children: [] })),
      },
    ];

    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockParentPage);

    renderWithRouter('parent-id', mockTree);

    await waitFor(() => {
      expect(screen.getByText('Child Page')).toBeTruthy();
      // File icon should be displayed (SVG element)
      const fileIcon = document.querySelector('svg');
      expect(fileIcon).toBeTruthy();
    });
  });

  it('should create correct links to child pages', async () => {
    const mockParentPage = {
      id: 'parent-id',
      parent: { type: 'workspace', workspace: true },
      properties: {
        title: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: 'Parent Page', link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'Parent Page',
              href: null,
            },
          ],
        },
      },
    } as any;

    const mockChildPages = [
      {
        id: 'child-1',
        parent: { type: 'page_id', page_id: 'parent-id' },
        icon: { type: 'emoji', emoji: '📄' },
        properties: {
          title: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: 'Child Page', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'Child Page',
                href: null,
              },
            ],
          },
        },
        last_edited_time: '2024-01-01T00:00:00.000Z',
      },
    ] as any;

    const mockTree: TreeNode[] = [
      {
        page: mockParentPage,
        children: mockChildPages.map((child: any) => ({ page: child, children: [] })),
      },
    ];

    vi.spyOn(notionModule, 'getPage').mockResolvedValue(mockParentPage);

    renderWithRouter('parent-id', mockTree);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Child Page/i });
      expect(link.getAttribute('href')).toBe('/page/child-1');
    });
  });
});
