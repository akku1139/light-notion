import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmojiPicker from './EmojiPicker';

describe('EmojiPicker', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  it('should render emoji picker', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByPlaceholderText('Search emojis...')).toBeTruthy();
    expect(screen.getByText('Smileys & People')).toBeTruthy();
  });

  it('should display category tabs', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('Smileys & People')).toBeTruthy();
    expect(screen.getByText('Animals & Nature')).toBeTruthy();
    expect(screen.getByText('Food & Drink')).toBeTruthy();
    expect(screen.getByText('Activities')).toBeTruthy();
    expect(screen.getByText('Travel & Places')).toBeTruthy();
    expect(screen.getByText('Flags')).toBeTruthy();
  });

  it('should call onSelect when emoji is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const emojiButton = screen.getByTitle('😀');
    fireEvent.click(emojiButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith('😀');
  });

  it('should filter emojis when searching', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByPlaceholderText('Search emojis...');
    fireEvent.change(searchInput, { target: { value: '😀' } });
    
    // Should show filtered results
    expect(screen.getByTitle('😀')).toBeTruthy();
  });

  it('should clear search when clear button is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByPlaceholderText('Search emojis...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: '😀' } });
    
    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);
    
    expect(searchInput.value).toBe('');
  });

  it('should switch categories when category tab is clicked', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const animalsTab = screen.getByText('Animals & Nature');
    fireEvent.click(animalsTab);
    
    // Should show animals emojis
    expect(screen.getByTitle('🐶')).toBeTruthy();
  });

  it('should call onClose when clicking outside', () => {
    const { container } = render(
      <div>
        <div data-testid="outside">Outside</div>
        <EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />
      </div>
    );
    
    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display message when no emojis found', () => {
    render(<EmojiPicker onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByPlaceholderText('Search emojis...');
    fireEvent.change(searchInput, { target: { value: 'xyz123notfound' } });
    
    expect(screen.getByText('No emojis found')).toBeTruthy();
  });
});
