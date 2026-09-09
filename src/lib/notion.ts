import { getToken } from './auth';

const API_BASE = '/api/notion';

// Notion API version
const NOTION_VERSION = '2026-03-11';

// Re-export useful types from the SDK
export type {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client';

// Type aliases for convenience
export type NotionPage = import('@notionhq/client').PageObjectResponse;
export type NotionDatabase = import('@notionhq/client').DatabaseObjectResponse;
export type NotionBlock = import('@notionhq/client').BlockObjectResponse | import('@notionhq/client').PartialBlockObjectResponse;

interface NotionRequestOptions {
  method?: string;
  body?: unknown;
}

async function notionRequest(endpoint: string, options: NotionRequestOptions = {}): Promise<unknown> {
  const token = getToken();
  if (!token) {
    throw new Error('Notion API token is not set. Please configure it in Settings.');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-notion-token': token,
      'x-notion-version': NOTION_VERSION,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string; details?: string };
    throw new Error(errorData.message || errorData.details || `API error: ${response.status}`);
  }

  return response.json();
}

// API functions
export async function queryDatabase(
  databaseId: string,
  filter?: unknown,
  sorts?: unknown,
  startCursor?: string | null
): Promise<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }> {
  const body: Record<string, unknown> = { page_size: 50 };
  if (filter) body.filter = filter;
  if (sorts) body.sorts = sorts;
  if (startCursor) body.start_cursor = startCursor;

  return notionRequest(`/v1/databases/${databaseId}/query`, { body }) as Promise<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>;
}

export async function getDatabase(databaseId: string): Promise<NotionDatabase> {
  return notionRequest(`/v1/databases/${databaseId}`, { method: 'GET' }) as Promise<NotionDatabase>;
}

export async function getPage(pageId: string): Promise<NotionPage> {
  return notionRequest(`/v1/pages/${pageId}`, { method: 'GET' }) as Promise<NotionPage>;
}

export async function getBlocks(blockId: string): Promise<{ results: NotionBlock[]; has_more: boolean; next_cursor: string | null }> {
  return notionRequest(`/v1/blocks/${blockId}/children?page_size=100`, { method: 'GET' }) as Promise<{ results: NotionBlock[]; has_more: boolean; next_cursor: string | null }>;
}

export async function searchPages(query: string, startCursor?: string | null): Promise<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }> {
  const body: Record<string, unknown> = {
    query,
    filter: { property: 'object', value: 'page' as const },
    page_size: 50,
  };
  if (startCursor) {
    body.start_cursor = startCursor;
  }
  return notionRequest('/v1/search', { body }) as Promise<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>;
}

export async function updatePageProperties(pageId: string, properties: Record<string, unknown>): Promise<NotionPage> {
  return notionRequest(`/v1/pages/${pageId}`, {
    method: 'PATCH',
    body: { properties },
  }) as Promise<NotionPage>;
}

export async function appendBlocks(blockId: string, children: unknown[]): Promise<{ results: NotionBlock[] }> {
  return notionRequest(`/v1/blocks/${blockId}/children`, {
    method: 'PATCH',
    body: { children },
  }) as Promise<{ results: NotionBlock[] }>;
}

export async function deleteBlock(blockId: string): Promise<void> {
  await notionRequest(`/v1/blocks/${blockId}`, { method: 'DELETE' });
}

// Helper to extract title from a page
export function getPageTitle(page: NotionPage): string {
  if (!page.properties) return 'Untitled';

  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key];
    if (prop.type === 'title' && 'title' in prop && Array.isArray(prop.title)) {
      return prop.title.map((t: { plain_text: string }) => t.plain_text).join('') || 'Untitled';
    }
  }
  return 'Untitled';
}

// Helper to get page content as plain text
export function getPageExcerpt(page: NotionPage): string {
  if (!page.properties) return '';

  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key];
    if (prop.type === 'rich_text' && 'rich_text' in prop && Array.isArray(prop.rich_text)) {
      return prop.rich_text.map((t: { plain_text: string }) => t.plain_text).join('');
    }
  }
  return '';
}
