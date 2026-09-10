import { useEffect, useState } from 'react';

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

export default function TableOfContents({ content, onLoadMore, hasMore }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    const idCounts: Record<string, number> = {};
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      // Create ID from text (simple slugify)
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Handle empty ID
      if (!id) {
        id = 'heading';
      }
      
      // Handle duplicate IDs by adding a counter
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

  useEffect(() => {
    const updateActiveHeading = () => {
      const headingElements = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id]'));
      if (headingElements.length === 0) return;

      const scrollPosition = window.scrollY + 120; // Offset for sticky header

      // Find the heading that is currently in view
      let currentHeading = headingElements[0];
      
      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + window.scrollY;
        
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

    // Wait for DOM to be updated before setting initial heading
    const rafId = requestAnimationFrame(() => {
      updateActiveHeading();
    });

    // Listen to scroll events
    window.addEventListener('scroll', updateActiveHeading);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateActiveHeading);
    };
  }, [headings, content]);

  const handleClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    
    // Try to find the element
    let element = document.getElementById(id);
    
    // If element doesn't exist and we have more content to load, keep loading
    if (!element && hasMore && onLoadMore) {
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loop
      
      while (!element && hasMore && attempts < maxAttempts) {
        const hasMoreAfterLoad = await onLoadMore();
        // Wait a bit for DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
        element = document.getElementById(id);
        attempts++;
        
        if (!hasMoreAfterLoad) break;
      }
    }
    
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleTocScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // If scrolled near the bottom of TOC (within 50px), trigger load more
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav 
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
      onScroll={handleTocScroll}
    >
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        On this page
      </div>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`block py-1 text-sm transition-colors ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
