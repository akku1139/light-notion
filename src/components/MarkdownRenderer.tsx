import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { createHighlighter, type BundledLanguage, type BundledTheme } from 'shiki';

type ShikiHighlighter = Awaited<ReturnType<typeof createHighlighter>>;

// Singleton highlighter instance
let highlighterPromise: Promise<ShikiHighlighter> | null = null;

function getHighlighter(): Promise<ShikiHighlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'javascript', 'typescript', 'jsx', 'tsx',
        'python', 'rust', 'go', 'java', 'c', 'cpp', 'csharp',
        'css', 'scss', 'html', 'json', 'yaml', 'toml',
        'markdown', 'bash', 'shell', 'sql', 'graphql',
        'ruby', 'php', 'swift', 'kotlin', 'dart',
        'lua', 'r', 'matlab', 'docker', 'nginx',
        'xml', 'diff', 'ini', 'makefile',
      ],
    }) as Promise<ShikiHighlighter>;
  }
  return highlighterPromise;
}

interface MarkdownRendererProps {
  content: string;
}

// Helper to extract text content from React children
function extractTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextContent).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const props = children.props as { children?: React.ReactNode };
    return extractTextContent(props.children);
  }
  return '';
}

// Custom code block component that uses shiki
function CodeBlock({ className, children, ...props }: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = extractTextContent(children).replace(/\n$/, '');

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const codeRef = useRef(code);
  const langRef = useRef(lang);

  useEffect(() => {
    // Skip re-highlighting if code and lang haven't changed
    if (codeRef.current === code && langRef.current === lang && highlightedHtml) return;
    codeRef.current = code;
    langRef.current = lang;

    if (!lang) {
      setHighlightedHtml(null);
      return;
    }

    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      try {
        // Check if language is loaded
        const loadedLangs = highlighter.getLoadedLanguages() as string[];
        if (!loadedLangs.includes(lang)) {
          setHighlightedHtml(null);
          return;
        }
        const html = highlighter.codeToHtml(code, {
          lang: lang as BundledLanguage,
          theme: 'github-dark' as BundledTheme,
        });
        setHighlightedHtml(html);
      } catch {
        setHighlightedHtml(null);
      }
    });

    return () => { cancelled = true; };
  }, [code, lang, highlightedHtml]);

  if (lang && highlightedHtml) {
    return (
      <div
        className="shiki-container rounded-lg overflow-hidden my-4"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    );
  }

  return (
    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-4">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isReady, setIsReady] = useState(false);
  const headingIdCounts = useRef<Record<string, number>>({});

  useEffect(() => {
    // Pre-load highlighter
    getHighlighter().then(() => setIsReady(true));
  }, []);

  // Reset heading counter when content changes
  useEffect(() => {
    headingIdCounts.current = {};
  }, [content]);

  const generateHeadingId = (text: string): string => {
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Handle duplicate IDs by adding a counter
    if (headingIdCounts.current[id] !== undefined) {
      headingIdCounts.current[id]++;
      id = `${id}-${headingIdCounts.current[id]}`;
    } else {
      headingIdCounts.current[id] = 0;
    }
    
    return id;
  };

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:tracking-tight
      prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
      prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
      prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
      prose-p:leading-7 prose-p:mb-4
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
      prose-img:rounded-lg prose-img:shadow-md
      prose-li:leading-7
      prose-table:border-collapse
      [&_table]:w-full [&_table]:border [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-800 [&_td]:border [&_td]:px-3 [&_td]:py-2
      [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
      prose-code:text-sm prose-code:font-mono
      prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre({ children, ...props }) {
            // Extract code element from children
            const child = Array.isArray(children) ? children[0] : children;
            if (child && typeof child === 'object' && 'props' in child) {
              const codeProps = child.props as { className?: string; children?: React.ReactNode };
              // Pass the actual children (could be string or React element)
              return (
                <CodeBlock className={codeProps.className}>
                  {codeProps.children}
                </CodeBlock>
              );
            }
            return <pre {...props}>{children}</pre>;
          },
          code({ className, children, ...props }) {
            // Inline code (not inside pre)
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            // For inline code, render children as-is
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1({ children, ...props }) {
            const text = extractTextContent(children);
            const id = generateHeadingId(text);
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2({ children, ...props }) {
            const text = extractTextContent(children);
            const id = generateHeadingId(text);
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3({ children, ...props }) {
            const text = extractTextContent(children);
            const id = generateHeadingId(text);
            return <h3 id={id} {...props}>{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {!isReady && (
        <div className="text-xs text-gray-400 mt-2">Loading syntax highlighter...</div>
      )}
    </div>
  );
}
