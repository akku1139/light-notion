import { useEffect, useState, useRef, memo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  onLoadMore?: () => Promise<boolean>;
  hasMore?: boolean;
}

const TableOfContents = memo(function TableOfContents({ content, onLoadMore, hasMore }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const tickingRef = useRef(false);
  const headingsRef = useRef<TocItem[]>([]);
  const tocRef = useRef<HTMLElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Keep headingsRef in sync
  useEffect(() => {
    headingsRef.current = headings;
  }, [headings]);

  // Extract headings from content
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    const idCounts: Record<string, number> = {};
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      if (!id) {
        id = 'heading';
      }
      
      if (idCounts[id] !== undefined) {
        idCounts[id]++;
        id = `${id}-${idCounts[id]}`;
      } else {
        idCounts[id] = 0;
      }
      
      items.push({ id, text, level });
    }

    setHeadings(items);
  }, [content]);

  // Auto-scroll TOC to active heading
  useEffect(() => {
    if (!autoScroll || !activeId || !tocRef.current) return;

    const tocContainer = tocRef.current;
    const activeElement = tocContainer.querySelector(`[data-toc-id="${activeId}"]`);
    
    if (activeElement) {
      // Mark this as a programmatic scroll so handleTocScroll ignores it
      isProgrammaticScrollRef.current = true;
      
      // Calculate scroll position to center the active element in TOC container
      // Using scrollTop directly instead of scrollIntoView to avoid affecting main page scroll
      const containerRect = tocContainer.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      const elementTop = elementRect.top - containerRect.top;
      const containerHeight = tocContainer.clientHeight;
      const elementHeight = activeElement.clientHeight;
      
      // Center the element in the container
      const targetScrollTop = tocContainer.scrollTop + elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      // Smooth scroll within TOC container only
      tocContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });

      // Reset flag after scroll animation completes
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  }, [activeId, autoScroll]);

  // Detect user manual scroll in TOC
  const handleTocScroll = () => {
    // Ignore programmatic scrolls (from scrollIntoView)
    if (isProgrammaticScrollRef.current) return;

    // User manually scrolled - disable auto-scroll
    setAutoScroll(false);
  };

  // Scroll handler for main page
  useEffect(() => {
    const updateActiveHeading = () => {
      const headingElements = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id]'));
      if (headingElements.length === 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const headerHeight = 100;
      const scrollPosition = scrollTop + headerHeight;

      let currentHeading = headingElements[0];
      
      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + scrollTop;
        
        if (headingTop <= scrollPosition) {
          currentHeading = heading;
        } else {
          break;
        }
      }

      if (currentHeading && currentHeading.id) {
        setActiveId(currentHeading.id);
      }
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          updateActiveHeading();
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    const initialTimeout = setTimeout(() => {
      updateActiveHeading();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    
    // Enable auto-scroll when user clicks a TOC item
    setAutoScroll(true);
    
    let element = document.getElementById(id);
    
    if (!element && hasMore && onLoadMore) {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!element && hasMore && attempts < maxAttempts) {
        const hasMoreAfterLoad = await onLoadMore();
        await new Promise(resolve => setTimeout(resolve, 100));
        element = document.getElementById(id);
        attempts++;
        
        if (!hasMoreAfterLoad) break;
      }
    }
    
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleTocBottomScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-20 flex flex-col max-h-[calc(100vh-6rem)]">
      {/* Sticky header */}
      <div className="flex items-center justify-between mb-2 pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-t-lg px-3 py-2 flex-shrink-0">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          On this page
        </div>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-xs px-2 py-1 rounded-md transition-colors ${
            autoScroll
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
          title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
        >
          {autoScroll ? 'Auto' : 'Manual'}
        </button>
      </div>
      
      {/* Scrollable list */}
      <nav 
        ref={tocRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={(e) => {
          handleTocScroll();
          handleTocBottomScroll(e);
        }}
      >
        <ul className="space-y-1 py-1">
          {headings.map((heading) => (
            <li
              key={heading.id}
              data-toc-id={heading.id}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block py-1 text-sm transition-colors border-l-2 pl-2 ${
                  activeId === heading.id
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
});

export default TableOfContents;
