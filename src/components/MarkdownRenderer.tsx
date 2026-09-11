import { useEffect, useState, useRef, memo, useMemo } from 'react';
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
  if (children && typeof children === 'object') {
    // Handle React elements
    if ('props' in children) {
      const props = children.props as { children?: React.ReactNode };
      return extractTextContent(props.children);
    }
    // Handle other objects (shouldn't happen, but just in case)
    return '';
  }
  return '';
}

// Custom code block component that uses shiki - memoized to prevent unnecessary re-renders
const CodeBlock = memo(function CodeBlock({ className, children }: {
  className?: string;
  children?: React.ReactNode;
}) {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = useMemo(() => extractTextContent(children).replace(/\n$/, ''), [children]);

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize with current dark mode state
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const prevHtmlRef = useRef<string | null>(null);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!lang) {
      return;
    }

    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      try {
        // Check if language is loaded
        const loadedLangs = highlighter.getLoadedLanguages() as string[];
        if (!loadedLangs.includes(lang)) {
          return;
        }
        const theme = isDarkMode ? 'github-dark' : 'github-light';
        const html = highlighter.codeToHtml(code, {
          lang: lang as BundledLanguage,
          theme: theme as BundledTheme,
        });
        
        // Remove background-color and color from inline styles
        // Keep other styles and syntax highlighting colors on spans
        const processedHtml = html
          .replace(/style="[^"]*background-color:[^"]*"/g, '')
          .replace(/class="shiki[^"]*"/g, 'class="shiki-code"');
        
        if (!cancelled) {
          prevHtmlRef.current = processedHtml;
          setHighlightedHtml(processedHtml);
        }
      } catch {
        // Keep previous highlighted HTML on error
      }
    });

    return () => { cancelled = true; };
  }, [code, lang, isDarkMode]);

  // Use cached HTML if available, otherwise show plain code
  const displayHtml = highlightedHtml || prevHtmlRef.current;

  if (lang && displayHtml) {
    return (
      <div
        className="shiki-container rounded-lg overflow-hidden my-2"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    );
  }

  return (
    <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto my-2">
      <code className={className}>
        {children}
      </code>
    </pre>
  );
});

// Memoized MarkdownRenderer to prevent unnecessary re-renders
const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isReady, setIsReady] = useState(false);
  const headingCounters = useRef<Record<string, number>>({});
  const lastContent = useRef<string>('');

  useEffect(() => {
    // Pre-load highlighter
    getHighlighter().then(() => setIsReady(true));
  }, []);

  // Reset counters when content changes
  if (content !== lastContent.current) {
    headingCounters.current = {};
    lastContent.current = content;
  }

  const generateHeadingId = (text: string): string => {
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    if (!id) {
      id = 'heading';
    }
    
    if (headingCounters.current[id] !== undefined) {
      headingCounters.current[id]++;
      id = `${id}-${headingCounters.current[id]}`;
    } else {
      headingCounters.current[id] = 0;
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
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = match !== null;
            
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
          h1({ children, node, ...props }) {
            const text = extractTextContent(children);
            const id = generateHeadingId(text);
            return <h1 id={id} data-toc-id={id} {...props}>{children}</h1>;
          },
          h2({ children, node, ...props }) {
            const text = extractTextContent(children);
            const id = generateHeadingId(text);
            return <h2 id={id} data-toc-id={id} {...props}>{children}</h2>;
          },
          h3({ children, node, ...props }) {
            const text = extractTextContent(children);
            const id = generateHeadingId(text);
            return <h3 id={id} data-toc-id={id} {...props}>{children}</h3>;
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
});

export default MarkdownRenderer;
