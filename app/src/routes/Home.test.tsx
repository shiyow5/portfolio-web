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
  it('shows the hero heading', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1, name: /level 1: home/i })).toBeInTheDocument();
  });

  it('renders the Recent Loot section', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 2, name: /recent loot/i })).toBeInTheDocument();
  });

  it('links to the gallery for the Start Quest CTA', () => {
    renderHome();
    const cta = screen.getByRole('link', { name: /start quest/i });
    expect(cta).toHaveAttribute('href', '/gallery');
  });

  it('features real works in Recent Loot, linking to their detail pages', () => {
    renderHome();
    const first = WORKS[0];
    const link = screen.getByRole('link', { name: new RegExp(first.title, 'i') });
    expect(link).toHaveAttribute('href', `/works/${first.id}`);
  });
});
