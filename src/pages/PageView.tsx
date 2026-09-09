import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, ExternalLink } from 'lucide-react';
import { getPage, getBlocks, getPageTitle, type NotionPage, type NotionBlock } from '../lib/notion';
import { blocksToMarkdown } from '../lib/markdown';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function PageView() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<NotionPage | null>(null);
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

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
    <div className="max-w-3xl mx-auto">
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
            src={page.cover.external?.url || page.cover.file?.url || ''}
            alt="Cover"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {page.icon && 'emoji' in (page.icon || {}) && (
            <span className="text-4xl">{(page.icon as { emoji: string }).emoji}</span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>Last edited: {new Date(page.last_edited_time).toLocaleString('ja-JP')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        {markdown ? (
          <MarkdownRenderer content={markdown} />
        ) : (
          <p className="text-gray-500 italic">This page has no content blocks.</p>
        )}
      </div>

      {/* Block count info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        {blocks.length} blocks loaded
      </div>
    </div>
  );
}
