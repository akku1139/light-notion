import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { getChildPages, getPage, getPageTitle, type NotionPage } from '../lib/notion';

interface TreeNode {
  page: NotionPage;
  children: TreeNode[];
}

interface TreeNodeComponentProps {
  node: TreeNode;
  depth: number;
  expandedNodes: Set<string>;
  toggleNode: (pageId: string) => void;
  formatDate: (dateStr: string) => string;
}

function TreeNodeComponent({ node, depth, expandedNodes, toggleNode, formatDate }: TreeNodeComponentProps) {
  const { page, children } = node;
  const title = getPageTitle(page);
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(page.id);

  return (
    <div>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group overflow-hidden"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleNode(page.id);
              }}
              className="flex-shrink-0 mt-0.5 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <div className="flex-shrink-0 w-6 mt-0.5" />
          )}

          {/* Icon */}
          <Link to={`/page/${page.id}`} className="flex-shrink-0 mt-0.5">
            {page.icon && page.icon.type === 'emoji' ? (
              <span className="text-2xl">{page.icon.emoji}</span>
            ) : (
              <FileText size={24} className="text-gray-400" />
            )}
          </Link>

          {/* Content */}
          <Link to={`/page/${page.id}`} className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1 min-w-0">
                <Clock size={12} className="flex-shrink-0" />
                <span className="truncate">{formatDate(page.last_edited_time)}</span>
              </span>
              {hasChildren && (
                <span className="text-gray-400">
                  {children.length} {children.length === 1 ? 'child' : 'children'}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {children.map(child => (
            <TreeNodeComponent
              key={child.page.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChildPages() {
  const { id } = useParams<{ id: string }>();
  const [parentPage, setParentPage] = useState<NotionPage | null>(null);
  const [childPages, setChildPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
        
        // Expand root nodes by default
        const rootIds = new Set<string>();
        children.forEach(page => {
          const parentId = page.parent.type === 'page_id' ? page.parent.page_id : null;
          if (!parentId || !children.some(p => p.id === parentId)) {
            rootIds.add(page.id);
          }
        });
        setExpandedNodes(rootIds);
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

  // Build tree structure from flat page list
  const buildTree = (pages: NotionPage[]): TreeNode[] => {
    const pageMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // First pass: create nodes
    pages.forEach(page => {
      pageMap.set(page.id, { page, children: [] });
    });

    // Second pass: build tree
    pages.forEach(page => {
      const node = pageMap.get(page.id)!;
      const parentId = page.parent.type === 'page_id' ? page.parent.page_id : null;
      
      if (parentId && pageMap.has(parentId)) {
        pageMap.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const toggleNode = (pageId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
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

      {/* Child pages tree */}
      {childPages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No child pages found.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {buildTree(childPages).map(node => (
            <TreeNodeComponent
              key={node.page.id}
              node={node}
              depth={0}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
