import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTreeProvider, usePageTree } from './PageTreeContext';

// Test component that uses the context
function TestComponent() {
  const { tree, findNodeById } = usePageTree();
  
  return (
    <div>
      <div data-testid="tree-length">{tree.length}</div>
      <div data-testid="find-result">
        {findNodeById('test-id') ? 'found' : 'not found'}
      </div>
    </div>
  );
}

describe('PageTreeContext', () => {
  it('should provide empty tree by default', () => {
    render(
      <PageTreeProvider>
        <TestComponent />
      </PageTreeProvider>
    );

    expect(screen.getByTestId('tree-length').textContent).toBe('0');
  });

  it('should return null when finding non-existent node', () => {
    render(
      <PageTreeProvider>
        <TestComponent />
      </PageTreeProvider>
    );

    expect(screen.getByTestId('find-result').textContent).toBe('not found');
  });

  it('should throw error when usePageTree is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePageTree must be used within a PageTreeProvider');

    consoleError.mockRestore();
  });
});
