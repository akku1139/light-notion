import { getToken } from './auth';

const API_BASE = '/api/notion';

// Notion API version
const NOTION_VERSION = '2022-06-28';

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
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Database types
export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  icon?: { emoji?: string; external?: { url: string } };
  properties: Record<string, unknown>;
}

export interface NotionPage {
  id: string;
  object: 'page';
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
  icon?: { emoji?: string; external?: { url: string } };
  cover?: { external?: { url: string }; file?: { url: string } };
  url: string;
}

export interface NotionProperty {
  id: string;
  type: string;
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  [key: string]: unknown;
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: unknown;
}

export interface SearchResult {
  object: 'list';
  results: Array<NotionPage | NotionDatabase>;
  has_more: boolean;
  next_cursor: string | null;
}

// API functions
export async function queryDatabase(databaseId: string, filter?: unknown, sorts?: unknown): Promise<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }> {
  const body: Record<string, unknown> = {};
  if (filter) body.filter = filter;
  if (sorts) body.sorts = sorts;
  body.page_size = 50;

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

export async function searchPages(query: string, databaseId?: string): Promise<SearchResult> {
  const body: Record<string, unknown> = {
    query,
    filter: { property: 'object', value: 'page' },
    page_size: 20,
  };
  if (databaseId) {
    body.filter = { value: 'page', property: 'object' };
    body.filter = {
      property: 'object',
      value: 'page',
    };
  }
  return notionRequest('/v1/search', { body }) as Promise<SearchResult>;
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
  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key];
    if (prop.type === 'title' && prop.title) {
      return prop.title.map(t => t.plain_text).join('') || 'Untitled';
    }
  }
  return 'Untitled';
}

// Helper to get page content as plain text
export function getPageExcerpt(page: NotionPage): string {
  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key];
    if (prop.type === 'rich_text' && prop.rich_text) {
      return prop.rich_text.map(t => t.plain_text).join('');
    }
  }
  return '';
}
