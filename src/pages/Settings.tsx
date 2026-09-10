import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Database, Check, ExternalLink } from 'lucide-react';
import { getToken, setToken, removeToken, getDatabaseId, setDatabaseId, removeDatabaseId, isAuthenticated } from '../lib/auth';

export default function Settings() {
  const navigate = useNavigate();
  const [token, setTokenState] = useState(getToken() || '');
  const [databaseId, setDatabaseIdState] = useState(getDatabaseId() || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = 'Settings - Notion Lite';
  }, []);

  const handleSave = () => {
    if (token.trim()) {
      setToken(token.trim());
    } else {
      removeToken();
    }
    if (databaseId.trim()) {
      setDatabaseId(databaseId.trim());
    } else {
      removeDatabaseId();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    removeToken();
    removeDatabaseId();
    setTokenState('');
    setDatabaseIdState('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>⚙️</span> Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* API Token */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Key size={16} className="text-gray-500" />
            Notion Internal Integration Token
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Create an integration at{' '}
            <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 hover:underline">
              notion.so/my-integrations <ExternalLink size={12} />
            </a>
            {' '}and paste the token here.
          </p>
          <input
            type="password"
            value={token}
            onChange={e => setTokenState(e.target.value)}
            placeholder="ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Database ID */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Database size={16} className="text-gray-500" />
            Database ID (optional)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            The ID of the Notion database to browse. You can find it in the database URL.
          </p>
          <input
            type="text"
            value={databaseId}
            onChange={e => setDatabaseIdState(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {saved ? <Check size={16} /> : null}
            {saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            Clear All
          </button>
          {isAuthenticated() && (
            <button
              onClick={() => navigate('/pages')}
              className="ml-auto px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
            >
              Go to Pages →
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">ℹ️ How to set up</h3>
        <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">Notion Integrations</a> and create a new integration</li>
          <li>Copy the "Internal Integration Secret" and paste it above</li>
          <li>Share your database with the integration (click ••• → Connections → your integration)</li>
          <li>Copy the database ID from the URL and paste it above</li>
          <li>Deploy the API proxy (Cloudflare Pages Functions) to handle CORS</li>
        </ol>
      </div>
    </div>
  );
}
