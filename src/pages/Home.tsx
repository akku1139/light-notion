import { Link } from 'react-router-dom';
import { FileText, Search, Settings, ArrowRight } from 'lucide-react';
import { isAuthenticated, getDatabaseId } from '../lib/auth';

export default function HomePage() {
  const authenticated = isAuthenticated();
  const hasDb = !!getDatabaseId();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Notion Lite Client
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          A lightweight Notion client for viewing, searching, and editing your pages.
        </p>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Setup Status</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${authenticated ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              API Token: {authenticated ? 'Configured ✓' : 'Not configured'}
            </span>
            {!authenticated && (
              <Link to="/settings" className="text-xs text-blue-600 hover:underline ml-auto">Configure →</Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${hasDb ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              Database: {hasDb ? 'Set ✓' : 'Not set (optional)'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/pages"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
        >
          <FileText size={24} className="text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">Browse Pages</h3>
          <p className="text-sm text-gray-500">View your Notion database pages</p>
          <ArrowRight size={16} className="mt-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link
          to="/search"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
        >
          <Search size={24} className="text-green-600 mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-green-600 transition-colors">Search</h3>
          <p className="text-sm text-gray-500">Search across your workspace</p>
          <ArrowRight size={16} className="mt-3 text-gray-400 group-hover:text-green-600 transition-colors" />
        </Link>

        <Link
          to="/settings"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
        >
          <Settings size={24} className="text-purple-600 mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">Settings</h3>
          <p className="text-sm text-gray-500">Configure API token & database</p>
          <ArrowRight size={16} className="mt-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </Link>
      </div>

      {/* Info */}
      <div className="mt-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-semibold mb-3 text-sm text-gray-700 dark:text-gray-300">Features</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-center gap-2">✓ Browse pages from a Notion database</li>
          <li className="flex items-center gap-2">✓ View pages with Markdown rendering</li>
          <li className="flex items-center gap-2">✓ Edit pages (Markdown ↔ Notion blocks)</li>
          <li className="flex items-center gap-2">✓ Full-text search across workspace</li>
          <li className="flex items-center gap-2">✓ API proxy via Cloudflare Pages Functions</li>
          <li className="flex items-center gap-2">✓ Local token storage (no server auth needed)</li>
        </ul>
      </div>
    </div>
  );
}
