import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { getPage, getBlocks, getPageTitle, type NotionPage, type NotionBlock } from '../lib/notion';
import { blocksToMarkdown } from '../lib/markdown';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TableOfContents from '../components/TableOfContents';

export default function PageView() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<NotionPage | null>(null);
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const loadPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pageData, blocksData] = await Promise.all([
          getPage(id),
          getBlocks(id),
        ]);
        setPage(pageData);
        setBlocks(blocksData.results);
        setMarkdown(blocksToMarkdown(blocksData.results));
        setHasMore(blocksData.has_more);
        setNextCursor(blocksData.next_cursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!hasMore || !nextCursor || loadingMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && nextCursor && !loadingMore) {
          setLoadingMore(true);
          try {
            const response = await fetch(`/api/notion/v1/blocks/${id}/children?start_cursor=${nextCursor}&page_size=100`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-notion-token': localStorage.getItem('notion_api_token') || '',
                'x-notion-version': '2026-03-11',
              },
            });
            
            if (!response.ok) throw new Error('Failed to load more blocks');
            
            const data = await response.json() as { results: NotionBlock[]; has_more: boolean; next_cursor: string | null };
            const newBlocks = data.results;
            
            setBlocks(prev => [...prev, ...newBlocks]);
            setMarkdown(prev => prev + '\n' + blocksToMarkdown(newBlocks));
            setHasMore(data.has_more);
            setNextCursor(data.next_cursor);
          } catch (err) {
            console.error('Failed to load more blocks:', err);
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadingMore, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
        <Link to="/pages" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft size={14} /> Back to list
        </Link>
      </div>
    );
  }

  if (!page) return null;

  const title = getPageTitle(page);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/pages" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to list
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ExternalLink size={14} /> Open in Notion
          </a>
          <Link
            to={`/edit/${page.id}`}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={14} /> Edit
          </Link>
        </div>
      </div>

      {/* Cover image */}
      {page.cover && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={page.cover.type === 'external' ? page.cover.external.url : page.cover.type === 'file' ? page.cover.file.url : ''}
            alt="Cover"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {page.icon && page.icon.type === 'emoji' && (
            <span className="text-4xl">{page.icon.emoji}</span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>Last edited: {new Date(page.last_edited_time).toLocaleString('ja-JP')}</span>
        </div>
      </div>

      {/* Two column layout */}
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            {markdown ? (
              <MarkdownRenderer content={markdown} />
            ) : (
              <p className="text-gray-500 italic">This page has no content blocks.</p>
            )}
          </div>

          {/* Loading indicator for infinite scroll */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-gray-500">Loading more content...</span>
            </div>
          )}

          {/* Intersection observer target */}
          {hasMore && !loadingMore && (
            <div ref={observerRef} className="h-20 flex items-center justify-center">
              <p className="text-sm text-gray-400">Scroll to load more</p>
            </div>
          )}

          {/* Block count info */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            {blocks.length} blocks loaded
            {hasMore && ' (more available)'}
          </div>
        </div>

        {/* Table of Contents */}
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <TableOfContents content={markdown} />
          </div>
        </aside>
      </div>
    </div>
  );
}
