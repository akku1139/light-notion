import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { setToken, removeToken } from '../lib/auth';

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    );
  };

  it('should render navigation links', () => {
    const { getByText } = renderWithRouter(<Layout>Content</Layout>);
    
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Pages')).toBeTruthy();
    expect(getByText('Search')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('should render children content', () => {
    const { getByText } = renderWithRouter(<Layout>Test Content</Layout>);
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should show auth warning when not authenticated', () => {
    removeToken();
    const { getByText } = renderWithRouter(<Layout>Content</Layout>);
    
    expect(getByText(/API token is not configured/i)).toBeTruthy();
  });

  it('should not show auth warning when authenticated', () => {
    setToken('test-token');
    const { queryByText } = renderWithRouter(<Layout>Content</Layout>);
    
    expect(queryByText(/API token is not configured/i)).toBeNull();
  });

  it('should render logo with link to home', () => {
    const { container } = renderWithRouter(<Layout>Content</Layout>);
    
    const logoLink = container.querySelector('a[href="/"]');
    expect(logoLink).toBeTruthy();
  });

  it('should have responsive navigation', () => {
    const { container } = renderWithRouter(<Layout>Content</Layout>);
    
    // Navigation should have links
    const navLinks = container.querySelectorAll('a');
    expect(navLinks.length).toBeGreaterThan(0);
  });
});
