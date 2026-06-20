import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NotFound } from './NotFound';

function renderNotFound() {
  return render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>,
  );
}

describe('NotFound route', () => {
  it('shows the 404 heading', () => {
    renderNotFound();
    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
  });

  it('offers a link back to the atelier home', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /return to atelier/i })).toHaveAttribute('href', '/');
  });
});
