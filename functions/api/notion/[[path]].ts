// Cloudflare Pages Function - Notion API Proxy
// This proxies requests from the frontend to the Notion API,
// handling CORS and authentication.

const NOTION_API_BASE = 'https://api.notion.com';

interface Env {
  // Environment variables can be set in Cloudflare Pages dashboard
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Extract the Notion API path (everything after /api/notion)
  const notionPath = url.pathname.replace('/api/notion', '');
  const searchParams = url.search;

  // Get the token from the custom header
  const token = request.headers.get('x-notion-token');
  const notionVersion = request.headers.get('x-notion-version') || '2022-06-28';

  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing x-notion-token header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build the target URL
  const targetUrl = `${NOTION_API_BASE}${notionPath}${searchParams}`;

  // Prepare headers for Notion API
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': notionVersion,
    'Content-Type': 'application/json',
  };

  // Forward the request to Notion API
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'DELETE'
        ? await request.text()
        : undefined,
    });

    const data = await response.text();

    // Return with CORS headers
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-notion-token, x-notion-version',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy request to Notion API', details: String(error) }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-notion-token, x-notion-version',
      'Access-Control-Max-Age': '86400',
    },
  });
};
