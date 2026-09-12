import type { NotionPage } from './notion';

const CACHE_KEY_PREFIX = 'notion_pages_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  pages: NotionPage[];
  timestamp: number;
  databaseId: string;
}

export function getCachedPages(databaseId: string): NotionPage[] | null {
  try {
    const key = CACHE_KEY_PREFIX + databaseId;
    const cached = localStorage.getItem(key);
    
    if (!cached) {
      return null;
    }

    const cacheData: CacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;

    // Return cache if it's still fresh
    if (age < CACHE_DURATION) {
      return cacheData.pages;
    }

    // Cache is expired
    return null;
  } catch (err) {
    console.error('Failed to read cache:', err);
    return null;
  }
}

export function setCachedPages(databaseId: string, pages: NotionPage[]): void {
  try {
    const key = CACHE_KEY_PREFIX + databaseId;
    const cacheData: CacheData = {
      pages,
      timestamp: Date.now(),
      databaseId,
    };
    
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (err) {
    console.error('Failed to write cache:', err);
  }
}

export function clearCache(databaseId?: string): void {
  try {
    if (databaseId) {
      const key = CACHE_KEY_PREFIX + databaseId;
      localStorage.removeItem(key);
    } else {
      // Clear all cache entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}
