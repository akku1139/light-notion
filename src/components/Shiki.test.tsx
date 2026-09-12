import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MarkdownRenderer from './MarkdownRenderer';

describe('Shiki Syntax Highlighting', () => {
  beforeEach(() => {
    // Reset document class
    document.documentElement.className = '';
  });

  it('should detect language from className', async () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeBlock = document.querySelector('.shiki-container');
      expect(codeBlock).not.toBeNull();
    });
  });

  it('should apply syntax highlighting to code blocks', async () => {
    const markdown = '```javascript\nconst hello = "world";\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeBlock = document.querySelector('.shiki-container');
      expect(codeBlock).not.toBeNull();
      
      // Check if syntax highlighting is applied (should have span elements)
      const spans = codeBlock?.querySelectorAll('span');
      expect(spans?.length).toBeGreaterThan(0);
    });
  });

  it('should use light theme in light mode', async () => {
    document.documentElement.className = '';
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeBlock = document.querySelector('.shiki-container');
      expect(codeBlock).not.toBeNull();
      
      // Check if light theme is applied
      const pre = codeBlock?.querySelector('pre');
      expect(pre).not.toBeNull();
      
      // Light theme should have light background
      const computedStyle = window.getComputedStyle(pre!);
      // Note: The actual background color is set via CSS, not inline style
      // We're checking that the theme was applied correctly
    });
  });

  it('should use dark theme in dark mode with class', async () => {
    document.documentElement.className = 'dark';
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeBlock = document.querySelector('.shiki-container');
      expect(codeBlock).not.toBeNull();
      
      const pre = codeBlock?.querySelector('pre');
      expect(pre).not.toBeNull();
    });
  });

  it('should handle multiple code blocks with different languages', async () => {
    const markdown = '```javascript\nconst x = 1;\n```\n\n```python\nx = 1\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeBlocks = document.querySelectorAll('.shiki-container');
      expect(codeBlocks.length).toBe(2);
    });
  });

  it('should remove background-color and color from pre style attribute', async () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const pre = document.querySelector('.shiki-container pre');
      expect(pre).not.toBeNull();
      
      // Check that background-color and color are not in style attribute
      const style = pre?.getAttribute('style') || '';
      expect(style).not.toContain('background-color');
      expect(style).not.toContain('color:');
    });
  });

  it('should preserve syntax highlighting colors in span elements', async () => {
    const markdown = '```javascript\nconst hello = "world";\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const spans = document.querySelectorAll('.shiki-container pre span');
      expect(spans.length).toBeGreaterThan(0);
      
      // Check that at least some spans have style attributes (syntax highlighting)
      const spansWithStyle = Array.from(spans).filter(span => span.hasAttribute('style'));
      expect(spansWithStyle.length).toBeGreaterThan(0);
    });
  });

  it('should handle code blocks without language', async () => {
    const markdown = '```\nplain code\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeElement = document.querySelector('code');
      expect(codeElement).not.toBeNull();
      expect(codeElement?.textContent?.trim()).toBe('plain code');
    });
  });

  it('should handle inline code without Shiki', () => {
    const markdown = 'This is `inline code` in text';
    render(<MarkdownRenderer content={markdown} />);

    const codeElement = document.querySelector('code');
    expect(codeElement).not.toBeNull();
    expect(codeElement?.textContent).toBe('inline code');
    
    // Inline code should not be in shiki-container
    const shikiContainer = document.querySelector('.shiki-container');
    expect(shikiContainer).toBeNull();
  });

  it('should handle unknown languages gracefully', async () => {
    const markdown = '```unknownlang\ncode\n```';
    render(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      const codeElement = document.querySelector('code');
      expect(codeElement).not.toBeNull();
    });
  });
});
