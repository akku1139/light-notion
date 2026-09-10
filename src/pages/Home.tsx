import { Link } from 'react-router-dom';
import { FileText, Search, Settings, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { isAuthenticated, getDatabaseId } from '../lib/auth';

export default function HomePage() {
  const authenticated = isAuthenticated();
  const hasDb = !!getDatabaseId();

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 mb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
            <span className="text-4xl">📝</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Notion Lite Client
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            A lightweight, fast, and beautiful Notion client for viewing, searching, and editing your pages.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/pages"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
            >
              <Settings size={20} />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-12 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Setup Status</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your configuration is ready</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${authenticated ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                API Token
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {authenticated ? 'Configured' : 'Not configured'}
              </span>
              {!authenticated && (
                <Link to="/settings" className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Configure
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${hasDb ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Database Mode
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {hasDb ? 'Specific Database' : 'Entire Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          to="/pages"
          className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Browse Pages</h3>
            <p className="text-blue-100 text-sm mb-4">View and navigate your Notion pages</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Explore</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link
          to="/search"
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Search</h3>
            <p className="text-emerald-100 text-sm mb-4">Find content across your workspace</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Search</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link
          to="/settings"
          className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
              <Settings size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-purple-100 text-sm mb-4">Configure your preferences</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Configure</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Powerful Features</h3>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to work with Notion efficiently</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Globe size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Workspace & Database Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse entire workspace or specific databases</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Rich Markdown Rendering</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Beautiful rendering with math equations support</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Search size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Full-Text Search</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Find anything across your entire workspace</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Zap size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Lightning Fast</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimized performance with smart caching</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Shield size={20} className="text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Secure & Private</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Local token storage, no server auth needed</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Setup</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Deploy on Cloudflare Pages in minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
        <p>Built with React, Vite, and Tailwind CSS</p>
        <p className="mt-1">Powered by Notion API</p>
      </div>
    </div>
  );
}
