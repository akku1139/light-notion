import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Edit3, AlertCircle } from 'lucide-react';
import { getPage, getBlocks, getPageTitle, updatePageProperties, deleteBlock, appendBlocks, type NotionPage, type NotionBlock } from '../lib/notion';
import { blocksToMarkdown, markdownToNotionBlocks } from '../lib/markdown';

export default function PageEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<NotionPage | null>(null);
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

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
        setTitle(getPageTitle(pageData));
        setMarkdown(blocksToMarkdown(blocksData.results));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

  const handleSave = async () => {
    if (!id || !page) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update title if changed
      const currentTitle = getPageTitle(page);
      if (title !== currentTitle) {
        // Find the title property key
        const titleKey = Object.keys(page.properties).find(
          key => page.properties[key].type === 'title'
        );
        if (titleKey) {
          await updatePageProperties(id, {
            [titleKey]: {
              title: [{ text: { content: title } }],
            },
          });
        }
      }

      // For content update, we need to delete existing blocks and append new ones
      // First get existing blocks
      const existingBlocks = await getBlocks(id);

      // Delete existing blocks (non-archived)
      for (const block of existingBlocks.results) {
        try {
          await deleteBlock(block.id);
        } catch {
          // Some blocks might not be deletable, skip
        }
      }

      // Convert markdown to Notion blocks and append
      const newBlocks = markdownToNotionBlocks(markdown);
      if (newBlocks.length > 0) {
        // Notion API allows max 100 blocks per request
        const chunks = [];
        for (let i = 0; i < newBlocks.length; i += 100) {
          chunks.push(newBlocks.slice(i, i + 100));
        }
        for (const chunk of chunks) {
          await appendBlocks(id, chunk);
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
        <Link to="/pages" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft size={14} /> Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to={`/page/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to page
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {mode === 'edit' ? <Eye size={14} /> : <Edit3 size={14} />}
            {mode === 'edit' ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-700 dark:text-green-400">✓ Page saved successfully!</p>
        </div>
      )}

      {/* Title input */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Page title"
          className="w-full text-2xl font-bold px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800
            focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Content area */}
      {mode === 'edit' ? (
        <div>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            placeholder="Write your content in Markdown..."
            className="w-full h-[600px] px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800
              font-mono text-sm leading-relaxed resize-none
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <p className="mt-2 text-xs text-gray-400">
            Supports: headings (#), lists (-, 1.), code blocks (```), quotes (&gt;), dividers (---), to-do (- [ ])
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 min-h-[600px]">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          {markdown ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {markdown}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500 italic">No content</p>
          )}
        </div>
      )}
    </div>
  );
}
