import { Link, useLocation } from 'react-router-dom';
import { FileText, Search, Settings, Home } from 'lucide-react';
import { isAuthenticated } from '../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const authenticated = isAuthenticated();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pages', label: 'Pages', icon: FileText },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
            <span className="text-2xl">📝</span>
            <span className="hidden sm:inline">Notion Lite</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Auth warning */}
      {!authenticated && location.pathname !== '/settings' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">⚠️</span>
            <span className="text-sm text-amber-800 dark:text-amber-300">
              API token is not configured.{' '}
              <Link to="/settings" className="underline font-medium">
                Go to Settings
              </Link>
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
