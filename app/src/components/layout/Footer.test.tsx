import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the handcrafted copyright line', () => {
    render(<Footer />);
    expect(screen.getByText(/handcrafted with pixels/i)).toBeInTheDocument();
  });

  it('renders the GitHub and X social links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument();
  });

  it('points the social links at the real profiles', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /github/i }).getAttribute('href')).toContain(
      'github.com/shiyow5',
    );
    expect(screen.getByRole('link', { name: 'X' }).getAttribute('href')).toContain(
      'x.com/twinS_KNSN1415',
    );
  });

  it('shows the server-online status indicator', () => {
    render(<Footer />);
    expect(screen.getByText(/server online/i)).toBeInTheDocument();
  });
});
