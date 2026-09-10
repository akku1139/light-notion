import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, RefreshCw, Database, Globe, Loader2 } from 'lucide-react';
import { queryDatabase, searchPages, getPageTitle, getPageExcerpt, type NotionPage } from '../lib/notion';
import { getDatabaseId } from '../lib/auth';
import { getCachedPages, setCachedPages, clearCache } from '../lib/cache';

export default function PageList() {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const databaseId = getDatabaseId();
  const isDatabaseMode = !!databaseId;

  const loadPages = async (cursor?: string, forceRefresh = false) => {
    setLoading(!cursor);
    setLoadingMore(!!cursor);
    setError(null);

    const cacheKey = isDatabaseMode ? databaseId : 'workspace';

    try {
      // Check cache for initial load (not pagination)
      if (!cursor && !forceRefresh) {
        const cachedPages = getCachedPages(cacheKey);
        if (cachedPages) {
          setPages(cachedPages);
          setLoading(false);
          // Continue to fetch fresh data in background
        }
      }

      if (isDatabaseMode) {
        // Database mode: query specific database
        const result = await queryDatabase(
          databaseId,
          undefined,
          [{ timestamp: 'last_edited_time', direction: 'descending' }],
          cursor
        );
        
        if (cursor) {
          setPages(prev => [...prev, ...result.results]);
        } else {
          setPages(result.results);
          // Cache the first page of results
          setCachedPages(cacheKey, result.results);
        }
        setHasMore(result.has_more);
        setNextCursor(result.next_cursor);
      } else {
        // Workspace mode: search all pages
        const result = await searchPages('', cursor);
        if (cursor) {
          setPages(prev => [...prev, ...result.results]);
        } else {
          setPages(result.results);
          // Cache the first page of results
          setCachedPages(cacheKey, result.results);
        }
        setHasMore(result.has_more);
        setNextCursor(result.next_cursor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [databaseId]);

  const handleLoadMore = () => {
    if (nextCursor) {
      loadPages(nextCursor);
    }
  };

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
            {isDatabaseMode ? (
              <>
                <Database size={24} className="text-blue-600" />
                <span>Database Pages</span>
              </>
            ) : (
              <>
                <Globe size={24} className="text-green-600" />
                <span>All Workspace Pages</span>
              </>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {pages.length} pages loaded
            {!isDatabaseMode && ' (from entire workspace)'}
          </p>
        </div>
        <button
          onClick={() => {
            clearCache(isDatabaseMode ? databaseId : 'workspace');
            loadPages(undefined, true);
          }}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Force refresh (bypasses cache)"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Mode indicator */}
      {!isDatabaseMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Workspace mode:</strong> Showing all pages from your workspace. 
            Set a Database ID in Settings to browse a specific database instead.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && pages.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Loading pages...</span>
        </div>
      ) : (
        <>
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
                      {page.icon && page.icon.type === 'emoji' ? (
                        <span className="text-2xl">{page.icon.emoji}</span>
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

          {/* Load more button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && pages.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <p>No pages found.</p>
          {!isDatabaseMode && (
            <p className="text-sm mt-2">
              Make sure your integration has access to pages in your workspace.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
