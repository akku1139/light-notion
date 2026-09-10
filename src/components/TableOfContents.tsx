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

// Extract headings from markdown content - pure function, no side effects
function extractHeadings(content: string): TocItem[] {
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

  return items;
}

const TableOfContents = memo(function TableOfContents({ content, onLoadMore, hasMore }: TableOfContentsProps) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string>('');
  const tocRef = useRef<HTMLElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync active heading with DOM headings on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Skip if this scroll was triggered programmatically
      if (isProgrammaticScrollRef.current) return;

      // Find all heading elements in the main content
      const headingElements = Array.from(document.querySelectorAll('h1[data-toc-id], h2[data-toc-id], h3[data-toc-id]'));
      if (headingElements.length === 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const headerOffset = 120;

      // Find the last heading that is above the scroll position
      let currentId = '';
      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + scrollTop;
        
        if (headingTop <= scrollTop + headerOffset) {
          currentId = heading.getAttribute('data-toc-id') || '';
        } else {
          break;
        }
      }

      // If no heading is above scroll position, use the first heading
      if (!currentId && headingElements.length > 0) {
        currentId = headingElements[0].getAttribute('data-toc-id') || '';
      }

      if (currentId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // No dependencies - only run once

  // Auto-scroll TOC to show active heading
  useEffect(() => {
    if (!activeId || !tocRef.current) return;

    const tocContainer = tocRef.current;
    const activeElement = tocContainer.querySelector(`[data-toc-id="${activeId}"]`);
    
    if (activeElement) {
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

      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  }, [activeId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    
    let element = document.querySelector(`[data-toc-id="${id}"]`) as HTMLElement | null;
    
    // If element doesn't exist and we have more content to load, keep loading
    if (!element && hasMore && onLoadMore) {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!element && hasMore && attempts < maxAttempts) {
        const hasMoreAfterLoad = await onLoadMore();
        await new Promise(resolve => setTimeout(resolve, 100));
        element = document.querySelector(`[data-toc-id="${id}"]`) as HTMLElement | null;
        attempts++;
        
        if (!hasMoreAfterLoad) break;
      }
    }
    
    if (element) {
      // Mark as programmatic scroll to prevent handleScroll from overriding activeId
      isProgrammaticScrollRef.current = true;
      
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update highlight immediately
      setActiveId(id);
      
      // Reset flag and ensure correct highlight after scroll completes
      const finishScroll = () => {
        isProgrammaticScrollRef.current = false;
        setActiveId(id);
      };

      if ('onscrollend' in window) {
        window.addEventListener('scrollend', finishScroll, { once: true });
      } else {
        setTimeout(finishScroll, 1000);
      }
    }
  };

  const handleTocScroll = (e: React.UIEvent<HTMLElement>) => {
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
          onClick={() => {
            if (headings.length > 0) {
              const firstHeading = document.querySelector(`[data-toc-id="${headings[0].id}"]`) as HTMLElement;
              if (firstHeading) {
                isProgrammaticScrollRef.current = true;
                firstHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(headings[0].id);
                
                const finishScroll = () => {
                  isProgrammaticScrollRef.current = false;
                  setActiveId(headings[0].id);
                };
                
                if ('onscrollend' in window) {
                  window.addEventListener('scrollend', finishScroll, { once: true });
                } else {
                  setTimeout(finishScroll, 1000);
                }
              }
            }
          }}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Scroll to top"
        >
          ↑ Top
        </button>
      </div>
      
      {/* Scrollable list */}
      <nav 
        ref={tocRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={handleTocScroll}
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
export { extractHeadings };
