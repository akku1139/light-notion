import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TableOfContents from './TableOfContents';

describe('TableOfContents', () => {
  it('should render headings from content', () => {
    const content = '# Heading 1\n\n## Heading 2\n\n### Heading 3';
    render(<TableOfContents content={content} />);
    
    const links = document.querySelectorAll('a');
    expect(links.length).toBe(3);
    
    expect(links[0].textContent).toBe('Heading 1');
    expect(links[1].textContent).toBe('Heading 2');
    expect(links[2].textContent).toBe('Heading 3');
  });

  it('should handle duplicate headings', () => {
    const content = '# Title\n\n## Title\n\n## Title';
    render(<TableOfContents content={content} />);
    
    const links = document.querySelectorAll('a');
    expect(links.length).toBe(3);
    
    // Check that IDs are unique
    const ids = Array.from(links).map(link => link.getAttribute('href'));
    expect(ids[0]).toBe('#title');
    expect(ids[1]).toBe('#title-1');
    expect(ids[2]).toBe('#title-2');
  });

  it('should apply correct indentation based on heading level', () => {
    const content = '# H1\n\n## H2\n\n### H3';
    render(<TableOfContents content={content} />);
    
    const items = document.querySelectorAll('li');
    expect(items.length).toBe(3);
    
    // Check padding-left styles
    expect(items[0].style.paddingLeft).toBe('0px');
    expect(items[1].style.paddingLeft).toBe('12px');
    expect(items[2].style.paddingLeft).toBe('24px');
  });

  it('should not render when content has no headings', () => {
    const content = 'This is just plain text without headings';
    const { container } = render(<TableOfContents content={content} />);
    
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(0);
  });

  it('should call onLoadMore when scrolled to bottom', () => {
    const onLoadMore = vi.fn();
    const content = '# Heading 1\n\n## Heading 2';
    
    const { container } = render(
      <TableOfContents 
        content={content} 
        onLoadMore={onLoadMore}
        hasMore={true}
      />
    );
    
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    
    // Simulate scroll to bottom
    if (nav) {
      Object.defineProperty(nav, 'scrollHeight', { value: 100 });
      Object.defineProperty(nav, 'clientHeight', { value: 50 });
      Object.defineProperty(nav, 'scrollTop', { value: 45 });
      
      nav.dispatchEvent(new Event('scroll'));
      
      expect(onLoadMore).toHaveBeenCalled();
    }
  });
});
