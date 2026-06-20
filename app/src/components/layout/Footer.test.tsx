import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the handcrafted copyright line', () => {
    render(<Footer />);
    expect(screen.getByText(/handcrafted with pixels/i)).toBeInTheDocument();
  });

  it('renders the GitHub, Itch.io and Contact links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /itch\.io/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('points the GitHub link at github.com', () => {
    render(<Footer />);
    const href = screen.getByRole('link', { name: /github/i }).getAttribute('href');
    expect(href).toContain('github.com');
  });

  it('shows the server-online status indicator', () => {
    render(<Footer />);
    expect(screen.getByText(/server online/i)).toBeInTheDocument();
  });
});
