import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('renders the handcrafted copyright line', () => {
    renderFooter();
    expect(screen.getByText(/handcrafted with pixels/i)).toBeInTheDocument();
  });

  it('links to Contact, GitHub and X', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument();
  });

  it('points the social links at the real profiles', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /github/i }).getAttribute('href')).toContain(
      'github.com/shiyow5',
    );
    expect(screen.getByRole('link', { name: 'X' }).getAttribute('href')).toContain(
      'x.com/twinS_KNSN1415',
    );
  });

  it('shows the server-online status indicator', () => {
    renderFooter();
    expect(screen.getByText(/server online/i)).toBeInTheDocument();
  });
});
