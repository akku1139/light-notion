# Notion Lite Client

A lightweight Notion client built with React + Vite + Tailwind CSS, deployable on Cloudflare Pages.

## Features

- 📄 **Browse Pages** - View pages from a Notion database or entire workspace
- 👁️ **View Pages** - Render pages with Markdown (Notion blocks → Markdown conversion)
- ✏️ **Edit Pages** - Edit pages using Markdown (Markdown → Notion blocks conversion)
- 🔍 **Search** - Full-text search across your Notion workspace
- 🔢 **Math Equations** - Render LaTeX math equations with KaTeX (inline `$...$` and block `$$...$$`)
- 🔒 **Auth** - Local token storage (no server-side auth needed)
- 🔄 **API Proxy** - Cloudflare Pages Functions handles CORS & proxies to Notion API
- 🌐 **Workspace Mode** - Browse all pages without specifying a database ID

## Setup

### 1. Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name and select your workspace
4. Copy the "Internal Integration Secret" (starts with `ntn_` or `secret_`)

### 2. Share your database with the integration

1. Open your Notion database
2. Click `•••` (top right) → "Connections" → "Add connections"
3. Select your integration

### 3. Get the Database ID (Optional)

**Option A: Browse a specific database**

From the database URL:
```
https://www.notion.so/yourworkspace/DATABASE_ID?v=...
```

The DATABASE_ID is the 32-character hex string (with hyphens).

**Option B: Browse entire workspace**

Leave the Database ID empty. The app will use the search API to show all pages accessible to your integration.

### 4. Deploy to Cloudflare Pages

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy to Cloudflare Pages
# Upload the `dist/` directory along with the `functions/` directory
```

Or connect your Git repository to Cloudflare Pages for automatic deployments.

**Important**: Make sure to include the `functions/` directory in your deployment. Cloudflare Pages automatically detects and deploys these as Workers.

### 5. Configure the client

1. Open the deployed site
2. Go to Settings
3. Enter your Notion Integration Token
4. (Optional) Enter your Database ID to browse a specific database
   - Leave empty to browse your entire workspace
5. Save

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│   React SPA     │────▶│  Cloudflare Pages    │────▶│  Notion API │
│   (dist/)       │     │  Functions (proxy)   │     │             │
└─────────────────┘     └──────────────────────┘     └─────────────┘
        │                        │
        │   /api/notion/*        │  api.notion.com/v1/*
        │   (with x-notion-token)│  (with Authorization: Bearer)
        └────────────────────────┘
```

- **Frontend**: React SPA built with Vite, served as static assets
- **API Proxy**: Cloudflare Pages Functions (`functions/api/notion/[[path]].ts`)
  - Receives requests at `/api/notion/*`
  - Extracts the token from `x-notion-token` header
  - Proxies to `https://api.notion.com/*` with proper auth headers
  - Handles CORS preflight requests
- **Auth**: Token stored in browser's localStorage

## Notion API Version

Uses Notion API version `2026-03-11` (latest). This version includes:
- `position` object instead of `after` parameter for block operations
- `in_trash` field instead of `archived` field
- `meeting_notes` block type instead of `transcription`

## Local Development

```bash
npm run dev
```

Note: For local development, you'll need to either:
- Set up a local proxy to forward `/api/notion/*` to Notion API
- Or use a browser extension to disable CORS (for testing only)

## Type Checking

```bash
npm run typecheck
```

This runs TypeScript type checking on both the frontend (`src/`) and the Cloudflare Pages Functions (`functions/`).

## Tech Stack

- React 18
- Vite 6
- Tailwind CSS 4
- React Router 6
- react-markdown + remark-gfm
- @notionhq/client (Official Notion SDK v5.12.0+)
- Cloudflare Pages Functions (API proxy)
