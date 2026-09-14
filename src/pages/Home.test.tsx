import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import * as authModule from '../lib/auth';

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = mockMatchMedia;
    localStorage.clear();
  });

  it('should display home page title', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(false);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Notion Lite Client')).toBeTruthy();
  });

  it('should display navigation links', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(false);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Get Started')).toBeTruthy();
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('should display authentication status when not authenticated', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(false);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('API Token')).toBeTruthy();
    expect(screen.getByText('Not configured')).toBeTruthy();
  });

  it('should display authentication status when authenticated', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('API Token')).toBeTruthy();
    expect(screen.getByText('Configured')).toBeTruthy();
  });

  it('should display database status when database ID is set', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue('test-db-id');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Database Mode')).toBeTruthy();
    expect(screen.getByText('Specific Database')).toBeTruthy();
  });

  it('should display database status when database ID is not set', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Database Mode')).toBeTruthy();
    expect(screen.getByText('Entire Workspace')).toBeTruthy();
  });

  it('should display feature list', () => {
    vi.spyOn(authModule, 'isAuthenticated').mockReturnValue(false);
    vi.spyOn(authModule, 'getDatabaseId').mockReturnValue(null);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Powerful Features')).toBeTruthy();
    expect(screen.getByText('Workspace & Database Mode')).toBeTruthy();
    expect(screen.getByText('Rich Markdown Rendering')).toBeTruthy();
    expect(screen.getByText('Full-Text Search')).toBeTruthy();
  });
});
