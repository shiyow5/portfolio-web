import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TopNav } from './TopNav';

function renderNav() {
  return render(
    <MemoryRouter>
      <TopNav />
    </MemoryRouter>,
  );
}

describe('TopNav', () => {
  it('renders the brand and a collapsed menu trigger', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /shiyow/i })).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: /open menu/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the slide-in panel with the navigation links', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /gallery/i })).toHaveAttribute('href', '/gallery');
    expect(screen.getByRole('link', { name: /changelog/i })).toHaveAttribute('href', '/changelog');
  });

  it('closes the panel when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    );
  });
});
