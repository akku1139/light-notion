import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Clock, Loader2 } from 'lucide-react';
import { searchPages, getPageTitle, getPageExcerpt, type NotionPage } from '../lib/notion';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const result = await searchPages(query.trim());
      setResults(result.results as NotionPage[]);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>🔍</span> Search
      </h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoFocus
          />
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Searching...</span>
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} found
            {query && <span> for "<strong>{query}</strong>"</span>}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No pages found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {results.map(page => {
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
          )}
        </>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="text-center py-12 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>Enter a search term to find pages in your Notion workspace</p>
        </div>
      )}
    </div>
  );
}
