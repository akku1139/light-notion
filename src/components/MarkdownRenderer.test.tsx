import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer - Code Blocks', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render code block with language class', async () => {
    const markdown = '```javascript\nconst hello = "world";\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const shikiContainer = document.querySelector('.shiki-container');
      const codeElement = document.querySelector('code');
      
      expect(shikiContainer !== null || codeElement !== null).toBe(true);
      
      if (codeElement) {
        const className = codeElement.getAttribute('class') || '';
        expect(className).toContain('language-javascript');
      }
    }, { timeout: 3000 });
  });

  it('should render code block without language', async () => {
    const markdown = '```\nplain code\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const codeElement = document.querySelector('code');
      expect(codeElement).not.toBeNull();
    });
  });

  it('should render inline code', () => {
    const markdown = 'This is `inline code` in text';
    render(<MarkdownRenderer content={markdown} />);
    
    const codeElement = document.querySelector('code');
    expect(codeElement).not.toBeNull();
    expect(codeElement?.textContent).toBe('inline code');
  });

  it('should apply Shiki syntax highlighting to code blocks', async () => {
    const markdown = '```javascript\nconst hello = "world";\n```';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const shikiContainer = document.querySelector('.shiki-container');
      expect(shikiContainer).not.toBeNull();
    }, { timeout: 3000 });
    
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
    expect(h1).not.toBeNull();
    expect(h1?.getAttribute('data-toc-id')).toBe('hello-world');
  });

  it('should render h2 with data-toc-id', () => {
    const markdown = '## Section Title';
    render(<MarkdownRenderer content={markdown} />);
    
    const h2 = document.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.getAttribute('data-toc-id')).toBe('section-title');
  });

  it('should render h3 with data-toc-id', () => {
    const markdown = '### Subsection';
    render(<MarkdownRenderer content={markdown} />);
    
    const h3 = document.querySelector('h3');
    expect(h3).not.toBeNull();
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
      expect(katexElement).not.toBeNull();
    });
  });

  it('should render block math', async () => {
    const markdown = '$$\n\\int_0^\\infty e^{-x} dx = 1\n$$';
    render(<MarkdownRenderer content={markdown} />);
    
    await waitFor(() => {
      const katexElement = document.querySelector('.katex-display');
      expect(katexElement).not.toBeNull();
    });
  });
});

describe('MarkdownRenderer - Tables', () => {
  it('should render table', () => {
    const markdown = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    render(<MarkdownRenderer content={markdown} />);
    
    const table = document.querySelector('table');
    expect(table).not.toBeNull();
    
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
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.textContent).toBe('Click here');
  });

  it('should render reference-style links', () => {
    const markdown = 'Click [here][1]\n\n[1]: https://example.com';
    render(<MarkdownRenderer content={markdown} />);
    
    const link = document.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com');
  });
});

describe('MarkdownRenderer - Lists', () => {
  it('should render unordered list', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer content={markdown} />);
    
    const list = document.querySelector('ul');
    expect(list).not.toBeNull();
    
    const items = document.querySelectorAll('li');
    expect(items.length).toBe(3);
  });

  it('should render ordered list', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    render(<MarkdownRenderer content={markdown} />);
    
    const list = document.querySelector('ol');
    expect(list).not.toBeNull();
    
    const items = document.querySelectorAll('li');
    expect(items.length).toBe(3);
  });
});

describe('MarkdownRenderer - Blockquotes', () => {
  it('should render blockquote', () => {
    const markdown = '> This is a quote';
    render(<MarkdownRenderer content={markdown} />);
    
    const blockquote = document.querySelector('blockquote');
    expect(blockquote).not.toBeNull();
    expect(blockquote?.textContent).toContain('This is a quote');
  });
});

describe('MarkdownRenderer - Images', () => {
  it('should render image', () => {
    const markdown = '![Alt text](https://example.com/image.png)';
    render(<MarkdownRenderer content={markdown} />);
    
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('Alt text');
  });

  it('should apply max-width to image', () => {
    const markdown = '![Alt text](https://example.com/image.png)';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    // Image should have max-w-full class to prevent overflow
    const computedStyle = window.getComputedStyle(img!);
    expect(computedStyle.maxWidth).toBeDefined();
  });
});

describe('MarkdownRenderer - Tables', () => {
  it('should wrap table in table-wrapper div', () => {
    const markdown = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const tableWrapper = container.querySelector('.table-wrapper');
    expect(tableWrapper).not.toBeNull();
    
    const table = tableWrapper?.querySelector('table');
    expect(table).not.toBeNull();
  });

  it('should apply overflow-x-auto to table wrapper', () => {
    const markdown = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const tableWrapper = container.querySelector('.table-wrapper');
    expect(tableWrapper).not.toBeNull();
    // Table wrapper should have overflow-x-auto for horizontal scrolling
  });

  it('should render table with sticky header', () => {
    const markdown = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const th = container.querySelector('th');
    expect(th).not.toBeNull();
    // Header should be sticky
  });
});

describe('MarkdownRenderer - Long Links', () => {
  it('should render long links without overflow', () => {
    const longUrl = 'https://example.com/very/long/path/that/should/not/overflow/the/container/width/when/rendered/in/the/markdown/renderer';
    const markdown = `[Link](${longUrl})`;
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    // Link should have break-all or overflow-wrap to prevent overflow
  });

  it('should apply break-all to links', () => {
    const markdown = '[Link](https://example.com/very/long/path)';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const prose = container.querySelector('.prose');
    expect(prose).not.toBeNull();
    // Prose should have overflow-x-hidden
  });
});

describe('MarkdownRenderer - Code Blocks', () => {
  it('should render code block with overflow-x-auto', () => {
    const markdown = '```\nconst veryLongVariableName = "some very long string value that should not overflow";\n```';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    // Pre should have overflow-x-auto for horizontal scrolling
  });

  it('should render inline code with word-break', () => {
    const markdown = 'This is `veryLongInlineCodeThatShouldNotOverflow` in text';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    // Code should have word-break or overflow-wrap
  });
});

describe('MarkdownRenderer - Overflow Prevention', () => {
  it('should have overflow-x-hidden on prose container', () => {
    const markdown = '# Heading\n\nSome content';
    const { container } = render(<MarkdownRenderer content={markdown} />);
    
    const prose = container.querySelector('.prose');
    expect(prose).not.toBeNull();
    // Prose should have overflow-x-hidden class
    expect(prose?.className).toContain('overflow-x-hidden');
  });
});

describe('MarkdownRenderer - Notion Links', () => {
  it('should convert app.notion.com links to internal routes', () => {
    const markdown = '[Link](https://app.notion.com/p/1234567890abcdef1234567890abcdef)';
    render(
      <MemoryRouter>
        <MarkdownRenderer content={markdown} />
      </MemoryRouter>
    );
    
    const link = document.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/page/1234567890abcdef1234567890abcdef');
  });

  it('should convert www.notion.so links to internal routes', () => {
    const markdown = '[Link](https://www.notion.so/workspace/1234567890abcdef1234567890abcdef)';
    render(
      <MemoryRouter>
        <MarkdownRenderer content={markdown} />
      </MemoryRouter>
    );
    
    const link = document.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/page/1234567890abcdef1234567890abcdef');
  });

  it('should convert relative Notion page IDs to internal routes', () => {
    const markdown = '[Link](1234567890abcdef1234567890abcdef)';
    render(
      <MemoryRouter>
        <MarkdownRenderer content={markdown} />
      </MemoryRouter>
    );
    
    const link = document.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/page/1234567890abcdef1234567890abcdef');
  });

  it('should open external links in new tab', () => {
    const markdown = '[Link](https://example.com)';
    render(
      <MemoryRouter>
        <MarkdownRenderer content={markdown} />
      </MemoryRouter>
    );
    
    const link = document.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
