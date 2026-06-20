import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { About } from './About';
import { PROFILE } from '../lib/profile';

function renderAbout() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  );
}

describe('About route', () => {
  it('renders the character status heading', () => {
    renderAbout();
    expect(screen.getByRole('heading', { level: 1, name: /status/i })).toBeInTheDocument();
  });

  it('shows the character name from the profile data', () => {
    renderAbout();
    expect(screen.getByText(PROFILE.name)).toBeInTheDocument();
  });

  it('renders the Skills & Tech Stack section with every group label', () => {
    renderAbout();
    expect(screen.getByRole('heading', { name: /skills & tech stack/i })).toBeInTheDocument();
    for (const group of PROFILE.techStack) {
      expect(screen.getByText(group.label)).toBeInTheDocument();
    }
  });

  it('lists every passive perk', () => {
    renderAbout();
    for (const perk of PROFILE.perks) {
      expect(screen.getByText(perk)).toBeInTheDocument();
    }
  });

  it('links to the gallery quest log', () => {
    renderAbout();
    expect(screen.getByRole('link', { name: /see full quest log/i })).toHaveAttribute(
      'href',
      '/gallery',
    );
  });
});
