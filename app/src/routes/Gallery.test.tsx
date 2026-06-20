import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Gallery } from './Gallery';
import { CATEGORY_LABEL, WORKS } from '../lib/works';

function renderGallery() {
  return render(
    <MemoryRouter>
      <Gallery />
    </MemoryRouter>,
  );
}

describe('Gallery route', () => {
  it('renders the archive heading', () => {
    renderGallery();
    expect(
      screen.getByRole('heading', { level: 1, name: /archive of completed tasks/i }),
    ).toBeInTheDocument();
  });

  it('renders every work by default', () => {
    renderGallery();
    for (const work of WORKS) {
      expect(screen.getByText(work.title)).toBeInTheDocument();
    }
  });

  it('links each card to its detail route', () => {
    renderGallery();
    const first = WORKS[0];
    const link = screen.getByRole('link', { name: new RegExp(first.title, 'i') });
    expect(link).toHaveAttribute('href', `/works/${first.id}`);
  });

  it('narrows the list when a category filter is selected', async () => {
    const user = userEvent.setup();
    renderGallery();

    const category = WORKS[0].category;
    const inCategory = WORKS.filter((work) => work.category === category);
    const outOfCategory = WORKS.find((work) => work.category !== category);

    await user.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_LABEL[category], 'i') }),
    );

    expect(
      screen.getByRole('button', { name: new RegExp(CATEGORY_LABEL[category], 'i') }),
    ).toHaveAttribute('aria-pressed', 'true');
    for (const work of inCategory) {
      expect(screen.getByText(work.title)).toBeInTheDocument();
    }
    if (outOfCategory) {
      expect(screen.queryByText(outOfCategory.title)).not.toBeInTheDocument();
    }
  });
});
