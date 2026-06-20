import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Home } from './Home';
import { WORKS } from '../lib/works';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe('Home route', () => {
  it('shows the hero with the name and AI Engineer role', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1, name: /shiyow/i })).toBeInTheDocument();
    expect(screen.getByText(/ai engineer/i)).toBeInTheDocument();
  });

  it('offers a CTA to talk to the AI clone', () => {
    renderHome();
    expect(screen.getByRole('button', { name: /クローンと話す/ })).toBeInTheDocument();
  });

  it('renders the Recent Loot section', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 2, name: /recent loot/i })).toBeInTheDocument();
  });

  it('links the consultation CTA to the contact page', () => {
    renderHome();
    const cta = screen.getByRole('link', { name: /相談する/ });
    expect(cta).toHaveAttribute('href', '/contact');
  });

  it('features real works in Recent Loot, linking to their detail pages', () => {
    renderHome();
    const first = WORKS[0];
    const link = screen.getByRole('link', { name: new RegExp(first.title, 'i') });
    expect(link).toHaveAttribute('href', `/works/${first.id}`);
  });
});
