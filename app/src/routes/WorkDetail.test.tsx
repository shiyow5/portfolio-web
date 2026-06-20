import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WorkDetail } from './WorkDetail';
import { WORKS } from '../lib/works';

function renderWorkDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/works/:id" element={<WorkDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('WorkDetail route', () => {
  it('renders the matching work', () => {
    const work = WORKS[0];
    renderWorkDetail(`/works/${work.id}`);

    expect(
      screen.getByRole('heading', { level: 1, name: new RegExp(work.title, 'i') }),
    ).toBeInTheDocument();
    expect(screen.getByText(work.tagline)).toBeInTheDocument();
    for (const tech of work.tech) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
  });

  it('shows a not-found state for an unknown id', () => {
    renderWorkDetail('/works/totally-unknown-id');

    expect(screen.getByRole('heading', { name: /work not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to gallery/i })).toHaveAttribute(
      'href',
      '/gallery',
    );
  });

  it('exposes the external code link from the work data', () => {
    const work = WORKS.find((candidate) => candidate.links.github);
    expect(work).toBeDefined();
    if (!work?.links.github) return;

    renderWorkDetail(`/works/${work.id}`);
    expect(screen.getByRole('link', { name: /code/i })).toHaveAttribute('href', work.links.github);
  });
});
