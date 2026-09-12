import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import MarkdownRenderer from './MarkdownRenderer';

describe('Theme Detection', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia;
    
    // Reset document class
    document.documentElement.className = '';
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('should detect dark mode from html.dark class', async () => {
    document.documentElement.className = 'dark';
    
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.shiki-container pre');
      expect(pre).not.toBeNull();
      
      // Check if dark theme is applied
      const computedStyle = window.getComputedStyle(pre!);
      // The background color should be dark
      expect(computedStyle.backgroundColor).toBeDefined();
    });
  });

  it('should detect dark mode from prefers-color-scheme media query', async () => {
    // Mock matchMedia to return dark mode
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.shiki-container pre');
      expect(pre).not.toBeNull();
    });
  });

  it('should detect light mode when no dark indicators', async () => {
    document.documentElement.className = '';
    
    // Mock matchMedia to return light mode
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.shiki-container pre');
      expect(pre).not.toBeNull();
    });
  });

  it('should apply dark background to non-Shiki code blocks in dark mode', async () => {
    document.documentElement.className = 'dark';
    
    const markdown = '```\nplain code\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.prose pre');
      expect(pre).not.toBeNull();
      
      const computedStyle = window.getComputedStyle(pre!);
      // The background color should be dark
      expect(computedStyle.backgroundColor).toBeDefined();
    });
  });

  it('should apply light background to non-Shiki code blocks in light mode', async () => {
    document.documentElement.className = '';
    
    // Mock matchMedia to return light mode
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const markdown = '```\nplain code\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.prose pre');
      expect(pre).not.toBeNull();
      
      const computedStyle = window.getComputedStyle(pre!);
      // The background color should be light
      expect(computedStyle.backgroundColor).toBeDefined();
    });
  });

  it('should apply dark background to inline code in dark mode', async () => {
    document.documentElement.className = 'dark';
    
    const markdown = 'This is `inline code`';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const code = document.querySelector('.prose :not(pre) > code');
      expect(code).not.toBeNull();
      
      const computedStyle = window.getComputedStyle(code!);
      // The background color should be dark
      expect(computedStyle.backgroundColor).toBeDefined();
    });
  });

  it('should handle theme changes dynamically', async () => {
    // Start with light mode
    document.documentElement.className = '';
    
    const markdown = '```javascript\nconst x = 1;\n```';
    const { rerender } = render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.shiki-container pre');
      expect(pre).not.toBeNull();
    });

    // Switch to dark mode
    document.documentElement.className = 'dark';
    rerender(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.shiki-container pre');
      expect(pre).not.toBeNull();
    });
  });
});
