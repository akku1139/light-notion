import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Clock } from 'lucide-react';
import { getChildPages, getPage, getPageTitle, type NotionPage } from '../lib/notion';

export default function ChildPages() {
  const { id } = useParams<{ id: string }>();
  const [parentPage, setParentPage] = useState<NotionPage | null>(null);
  const [childPages, setChildPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadChildPages = async () => {
      setLoading(true);
      setError(null);

      try {
        const [parent, children] = await Promise.all([
          getPage(id),
          getChildPages(id),
        ]);
        setParentPage(parent);
        setChildPages(children);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load child pages');
      } finally {
        setLoading(false);
      }
    };

    loadChildPages();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
          <ArrowLeft size={14} /> Back to pages
        </Link>
      </div>
    );
  }

  const parentTitle = parentPage ? getPageTitle(parentPage) : 'Parent Page';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to={`/page/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-2">
          <ArrowLeft size={14} /> Back to parent page
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📁</span>
          <span>Child pages of "{parentTitle}"</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">{childPages.length} child page{childPages.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Child pages list */}
      {childPages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No child pages found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {childPages.map(page => {
            const title = getPageTitle(page);
            return (
              <Link
                key={page.id}
                to={`/page/${page.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {title}
                    </h3>
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
    </div>
  );
}
