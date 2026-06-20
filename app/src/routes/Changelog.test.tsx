import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Changelog } from './Changelog';
import { ACTIVITIES, groupByYear } from '../lib/activity';

describe('Changelog route', () => {
  it('renders the chronicles heading', () => {
    render(<Changelog />);
    expect(screen.getByRole('heading', { level: 1, name: /chronicles/i })).toBeInTheDocument();
  });

  it('highlights the most recent activity', () => {
    render(<Changelog />);
    expect(screen.getAllByText(ACTIVITIES[0].title).length).toBeGreaterThan(0);
  });

  it('renders a heading for every year group', () => {
    render(<Changelog />);
    for (const group of groupByYear()) {
      expect(screen.getByRole('heading', { name: String(group.year) })).toBeInTheDocument();
    }
  });

  it('renders the connect section with the GitHub profile link', () => {
    render(<Changelog />);
    expect(screen.getByText(/connect with the party/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /source code/i })).toHaveAttribute(
      'href',
      'https://github.com/shiyow5',
    );
  });

  it('links the Broadcast entry to the real X profile', () => {
    render(<Changelog />);
    expect(screen.getByRole('link', { name: /broadcast/i })).toHaveAttribute(
      'href',
      'https://x.com/twinS_KNSN1415',
    );
  });
});
