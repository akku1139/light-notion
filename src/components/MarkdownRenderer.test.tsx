import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('should render code blocks with language', () => {
    const markdown = `
\`\`\`javascript
const hello = "world";
\`\`\`
`;
    render(<MarkdownRenderer content={markdown} />);
    
    // Check if code block is rendered
    const codeBlock = document.querySelector('.shiki-container');
    expect(codeBlock).toBeInTheDocument();
  });

  it('should render inline code without language', () => {
    const markdown = 'This is `inline code` in text';
    render(<MarkdownRenderer content={markdown} />);
    
    // Check if inline code is rendered
    const inlineCode = document.querySelector('code:not(.shiki-code)');
    expect(inlineCode).toBeInTheDocument();
  });

  it('should apply syntax highlighting to code blocks', async () => {
    const markdown = `
\`\`\`javascript
const hello = "world";
\`\`\`
`;
    render(<MarkdownRenderer content={markdown} />);
    
    // Wait for Shiki to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if syntax highlighting is applied
    const codeBlock = document.querySelector('.shiki-container');
    expect(codeBlock).toBeInTheDocument();
    
    // Check if spans are created for syntax highlighting
    const spans = codeBlock?.querySelectorAll('span');
    expect(spans?.length).toBeGreaterThan(0);
  });
});
