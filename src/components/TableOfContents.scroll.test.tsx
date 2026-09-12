import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TableOfContents from './TableOfContents';

describe('TableOfContents - Scroll Tracking', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollTo(0, 0);
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set first heading as active on initial render', async () => {
    const content = '# First Heading\n\n## Second Heading\n\n### Third Heading';
    
    // Create mock heading elements in the DOM
    document.body.innerHTML = `
      <h1 data-toc-id="first-heading" style="position: absolute; top: 0;">First Heading</h1>
      <h2 data-toc-id="second-heading" style="position: absolute; top: 500px;">Second Heading</h2>
      <h3 data-toc-id="third-heading" style="position: absolute; top: 1000px;">Third Heading</h3>
    `;
    
    // Mock getBoundingClientRect
    const headings = document.querySelectorAll('[data-toc-id]');
    headings.forEach((heading, index) => {
      const top = index * 500;
      heading.getBoundingClientRect = vi.fn(() => ({
        top,
        bottom: top + 50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON: () => {},
      }));
    });
    
    await act(async () => {
      render(
        <MemoryRouter>
          <TableOfContents content={content} />
        </MemoryRouter>
      );
    });
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    
    // First heading should be active
    expect(links[0].className).toContain('text-blue-600');
    expect(links[1].className).not.toContain('text-blue-600');
    expect(links[2].className).not.toContain('text-blue-600');
  });

  it('should update active heading when scrolling down', async () => {
    const content = '# First Heading\n\n## Second Heading\n\n### Third Heading';
    
    // Create mock heading elements in the DOM
    document.body.innerHTML = `
      <h1 data-toc-id="first-heading" style="position: absolute; top: 0;">First Heading</h1>
      <h2 data-toc-id="second-heading" style="position: absolute; top: 500px;">Second Heading</h2>
      <h3 data-toc-id="third-heading" style="position: absolute; top: 1000px;">Third Heading</h3>
    `;
    
    const headings = document.querySelectorAll('[data-toc-id]');
    
    // Initial state: all headings at their positions
    const mockGetBoundingClientRect = (index: number) => {
      const top = index * 500;
      return {
        top,
        bottom: top + 50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON: () => {},
      };
    };
    
    headings.forEach((heading, index) => {
      heading.getBoundingClientRect = vi.fn(() => mockGetBoundingClientRect(index));
    });
    
    await act(async () => {
      render(
        <MemoryRouter>
          <TableOfContents content={content} />
        </MemoryRouter>
      );
    });
    
    let links = screen.getAllByRole('link');
    
    // Initially, first heading should be active
    expect(links[0].className).toContain('text-blue-600');
    
    // Simulate scroll to 600px (past first heading, at second heading)
    await act(async () => {
      window.scrollTo(0, 600);
      
      // Update getBoundingClientRect to reflect scroll
      headings.forEach((heading, index) => {
        const originalTop = index * 500;
        const scrolledTop = originalTop - 600;
        heading.getBoundingClientRect = vi.fn(() => ({
          top: scrolledTop,
          bottom: scrolledTop + 50,
          left: 0,
          right: 100,
          width: 100,
          height: 50,
          x: 0,
          y: scrolledTop,
          toJSON: () => {},
        }));
      });
      
      window.dispatchEvent(new Event('scroll'));
    });
    
    links = screen.getAllByRole('link');
    
    // Second heading should now be active
    expect(links[0].className).not.toContain('text-blue-600');
    expect(links[1].className).toContain('text-blue-600');
    expect(links[2].className).not.toContain('text-blue-600');
  });

  it('should keep first heading active when scrolling slightly', async () => {
    const content = '# First Heading\n\n## Second Heading';
    
    // Create mock heading elements in the DOM
    document.body.innerHTML = `
      <h1 data-toc-id="first-heading" style="position: absolute; top: 0;">First Heading</h1>
      <h2 data-toc-id="second-heading" style="position: absolute; top: 500px;">Second Heading</h2>
    `;
    
    const headings = document.querySelectorAll('[data-toc-id]');
    
    // Initial state
    headings.forEach((heading, index) => {
      const top = index * 500;
      heading.getBoundingClientRect = vi.fn(() => ({
        top,
        bottom: top + 50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON: () => {},
      }));
    });
    
    await act(async () => {
      render(
        <MemoryRouter>
          <TableOfContents content={content} />
        </MemoryRouter>
      );
    });
    
    let links = screen.getAllByRole('link');
    
    // Initially, first heading should be active
    expect(links[0].className).toContain('text-blue-600');
    
    // Simulate scroll to 100px (still at first heading)
    await act(async () => {
      window.scrollTo(0, 100);
      
      // Update getBoundingClientRect to reflect scroll
      headings.forEach((heading, index) => {
        const originalTop = index * 500;
        const scrolledTop = originalTop - 100;
        heading.getBoundingClientRect = vi.fn(() => ({
          top: scrolledTop,
          bottom: scrolledTop + 50,
          left: 0,
          right: 100,
          width: 100,
          height: 50,
          x: 0,
          y: scrolledTop,
          toJSON: () => {},
        }));
      });
      
      window.dispatchEvent(new Event('scroll'));
    });
    
    links = screen.getAllByRole('link');
    
    // First heading should still be active
    expect(links[0].className).toContain('text-blue-600');
    expect(links[1].className).not.toContain('text-blue-600');
  });

  it('should handle content updates without losing active state', async () => {
    const initialContent = '# First Heading\n\n## Second Heading';
    
    // Create mock heading elements in the DOM
    document.body.innerHTML = `
      <h1 data-toc-id="first-heading" style="position: absolute; top: 0;">First Heading</h1>
      <h2 data-toc-id="second-heading" style="position: absolute; top: 500px;">Second Heading</h2>
    `;
    
    const headings = document.querySelectorAll('[data-toc-id]');
    
    headings.forEach((heading, index) => {
      const top = index * 500;
      heading.getBoundingClientRect = vi.fn(() => ({
        top,
        bottom: top + 50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON: () => {},
      }));
    });
    
    const { container, rerender } = render(
      <MemoryRouter>
        <TableOfContents content={initialContent} />
      </MemoryRouter>
    );
    
    let links = container.querySelectorAll('a');
    
    // Initially, first heading should be active
    expect(links[0].className).toContain('text-blue-600');
    
    // Update content (simulating 2nd page load)
    const newContent = '# First Heading\n\n## Second Heading\n\n## Third Heading';
    
    // Completely replace DOM with new headings
    document.body.innerHTML = `
      <h1 data-toc-id="first-heading" style="position: absolute; top: 0;">First Heading</h1>
      <h2 data-toc-id="second-heading" style="position: absolute; top: 500px;">Second Heading</h2>
      <h2 data-toc-id="third-heading" style="position: absolute; top: 1000px;">Third Heading</h2>
    `;
    
    const newHeadings = document.querySelectorAll('[data-toc-id]');
    newHeadings.forEach((heading, index) => {
      const top = index * 500;
      heading.getBoundingClientRect = vi.fn(() => ({
        top,
        bottom: top + 50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: top,
        toJSON: () => {},
      }));
    });
    
    await act(async () => {
      rerender(
        <MemoryRouter>
          <TableOfContents content={newContent} />
        </MemoryRouter>
      );
    });
    
    links = container.querySelectorAll('a');
    expect(links).toHaveLength(3);
    
    // First heading should still be active after content update
    expect(links[0].className).toContain('text-blue-600');
    expect(links[1].className).not.toContain('text-blue-600');
    expect(links[2].className).not.toContain('text-blue-600');
  });
});
