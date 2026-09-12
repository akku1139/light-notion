import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer - Code Blocks', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
  });

  it('should render code block with language class', async () => {
    const markdown = '```javascript\nconst hello = "world";\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const codeElement = document.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      // Check if className contains language-javascript
      expect(codeElement?.className).toContain('language-javascript');
    });
  });

  it('should render code block without language', async () => {
    const markdown = '```\nplain code\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const codeElement = document.querySelector('code');
      expect(codeElement).toBeInTheDocument();
    });
  });

  it('should render inline code', () => {
    const markdown = 'This is `inline code` in text';
    render(<MarkdownRenderer content={markdown} />);
    
    const codeElement = document.querySelector('code');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement?.textContent).toBe('inline code');
  });

  it('should apply Shiki syntax highlighting to code blocks', async () => {
    const markdown = '```javascript\nconst hello = "world";\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    // Wait for Shiki to process
    await waitFor(() => {
      const shikiContainer = document.querySelector('.shiki-container');
      expect(shikiContainer).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check if syntax highlighting is applied (should have span elements)
    const spans = document.querySelectorAll('.shiki-container span');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('should handle multiple code blocks', async () => {
    const markdown = '```javascript\nconst a = 1;\n```\n\n```python\nx = 2\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const codeElements = document.querySelectorAll('code');
      expect(codeElements.length).toBe(2);
    });
  });
});

describe('MarkdownRenderer - Headings', () => {
  it('should render h1 with data-toc-id', () => {
    const markdown = '# Hello World';
    render(<MarkdownRenderer content={markdown} />);
    
    const h1 = document.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.getAttribute('data-toc-id')).toBe('hello-world');
  });

  it('should render h2 with data-toc-id', () => {
    const markdown = '## Section Title';
    render(<MarkdownRenderer content={markdown} />);
    
    const h2 = document.querySelector('h2');
    expect(h2).toBeInTheDocument();
    expect(h2?.getAttribute('data-toc-id')).toBe('section-title');
  });

  it('should render h3 with data-toc-id', () => {
    const markdown = '### Subsection';
    render(<MarkdownRenderer content={markdown} />);
    
    const h3 = document.querySelector('h3');
    expect(h3).toBeInTheDocument();
    expect(h3?.getAttribute('data-toc-id')).toBe('subsection');
  });

  it('should handle duplicate heading IDs', () => {
    const markdown = '# Title\n\n## Title\n\n## Title';
    render(<MarkdownRenderer content={markdown} />);
    
    const headings = document.querySelectorAll('h1, h2, h3');
    expect(headings.length).toBe(3);
    
    const ids = Array.from(headings).map(h => h.getAttribute('data-toc-id'));
    expect(ids).toContain('title');
    expect(ids).toContain('title-1');
    expect(ids).toContain('title-2');
  });
});

describe('MarkdownRenderer - Math Equations', () => {
  it('should render inline math', async () => {
    const markdown = 'This is $E = mc^2$ inline math';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const katexElement = document.querySelector('.katex');
      expect(katexElement).toBeInTheDocument();
    });
  });

  it('should render block math', async () => {
    const markdown = '$$\n\\int_0^\\infty e^{-x} dx = 1\n$$';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const katexElement = document.querySelector('.katex-display');
      expect(katexElement).toBeInTheDocument();
    });
  });
});

describe('MarkdownRenderer - Tables', () => {
  it('should render table', () => {
    const markdown = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    render(<MarkdownRenderer content={markdown} />);
    
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
    
    const headers = document.querySelectorAll('th');
    expect(headers.length).toBe(2);
    
    const cells = document.querySelectorAll('td');
    expect(cells.length).toBe(2);
  });
});

describe('MarkdownRenderer - Links', () => {
  it('should render regular links', () => {
    const markdown = '[Click here](https://example.com)';
    render(<MarkdownRenderer content={markdown} />);
    
    const link = document.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.textContent).toBe('Click here');
  });

  it('should render reference-style links', () => {
    const markdown = 'Click [here][1]\n\n[1]: https://example.com';
    render(<MarkdownRenderer content={markdown} />);
    
    const link = document.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute('href')).toBe('https://example.com');
  });
});

describe('MarkdownRenderer - Lists', () => {
  it('should render unordered list', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer content={markdown} />);
    
    const list = document.querySelector('ul');
    expect(list).toBeInTheDocument();
    
    const items = document.querySelectorAll('li');
    expect(items.length).toBe(3);
  });

  it('should render ordered list', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    render(<MarkdownRenderer content={markdown} />);
    
    const list = document.querySelector('ol');
    expect(list).toBeInTheDocument();
    
    const items = document.querySelectorAll('li');
    expect(items.length).toBe(3);
  });
});

describe('MarkdownRenderer - Blockquotes', () => {
  it('should render blockquote', () => {
    const markdown = '> This is a quote';
    render(<MarkdownRenderer content={markdown} />);
    
    const blockquote = document.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.textContent).toContain('This is a quote');
  });
});

describe('MarkdownRenderer - Images', () => {
  it('should render image', () => {
    const markdown = '![Alt text](https://example.com/image.png)';
    render(<MarkdownRenderer content={markdown} />);
    
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('Alt text');
  });
});
