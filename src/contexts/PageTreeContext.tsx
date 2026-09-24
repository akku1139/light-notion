import { createContext, useContext, useState, ReactNode } from 'react';
import { type NotionPage } from '../lib/notion';

export interface TreeNode {
  page: NotionPage;
  children: TreeNode[];
}

interface PageTreeContextType {
  tree: TreeNode[];
  setTree: (tree: TreeNode[]) => void;
  findNodeById: (id: string) => TreeNode | null;
}

const PageTreeContext = createContext<PageTreeContextType | undefined>(undefined);

export function PageTreeProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<TreeNode[]>([]);

  const findNodeById = (id: string, nodes: TreeNode[] = tree): TreeNode | null => {
    for (const node of nodes) {
      if (node.page.id === id) {
        return node;
      }
      const found = findNodeById(id, node.children);
      if (found) {
        return found;
      }
    }
    return null;
  };

  return (
    <PageTreeContext.Provider value={{ tree, setTree, findNodeById }}>
      {children}
    </PageTreeContext.Provider>
  );
}

export function usePageTree() {
  const context = useContext(PageTreeContext);
  if (context === undefined) {
    throw new Error('usePageTree must be used within a PageTreeProvider');
  }
  return context;
}
