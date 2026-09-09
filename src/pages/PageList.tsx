import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, RefreshCw } from 'lucide-react';
import { queryDatabase, getDatabase, getPageTitle, getPageExcerpt, type NotionPage, type NotionDatabase } from '../lib/notion';
import { getDatabaseId } from '../lib/auth';

export default function PageList() {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [database, setDatabase] = useState<NotionDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const databaseId = getDatabaseId();

  const loadPages = async () => {
    if (!databaseId) {
      setError('Database ID is not configured. Please set it in Settings.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [db, result] = await Promise.all([
        getDatabase(databaseId),
        queryDatabase(databaseId, undefined, [
          { timestamp: 'last_edited_time', direction: 'descending' },
        ]),
      ]);
      setDatabase(db);
      setPages(result.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [databaseId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{database?.icon && 'emoji' in (database.icon || {}) ? (database.icon as { emoji: string }).emoji : '📄'}</span>
            {database?.title?.map(t => t.plain_text).join('') || 'Pages'}
          </h1>
          {database && (
            <p className="text-sm text-gray-500 mt-1">{pages.length} pages</p>
          )}
        </div>
        <button
          onClick={loadPages}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && pages.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-3">
          {pages.map(page => {
            const title = getPageTitle(page);
            const excerpt = getPageExcerpt(page);
            return (
              <Link
                key={page.id}
                to={`/page/${page.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {page.icon && 'emoji' in (page.icon || {}) ? (
                      <span className="text-2xl">{(page.icon as { emoji: string }).emoji}</span>
                    ) : (
                      <FileText size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {title}
                    </h3>
                    {excerpt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(page.last_edited_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && pages.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <p>No pages found. Check your database configuration.</p>
        </div>
      )}
    </div>
  );
}
