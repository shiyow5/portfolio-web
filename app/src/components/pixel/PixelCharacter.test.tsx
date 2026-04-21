import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PixelCharacter } from './PixelCharacter';

describe('PixelCharacter', () => {
  it('renders with accessible label', () => {
    render(<PixelCharacter ariaLabel="hero" />);
    expect(screen.getByRole('img', { name: 'hero' })).toBeInTheDocument();
  });

  it('respects scale prop in container size', () => {
    render(<PixelCharacter scale={5} ariaLabel="chibi" />);
    const node = screen.getByRole('img', { name: 'chibi' });
    expect(node).toHaveStyle({ width: '80px', height: '80px' });
  });
});
