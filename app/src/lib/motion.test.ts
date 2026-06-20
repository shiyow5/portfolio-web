import { describe, expect, it } from 'vitest';
import {
  easeOutExpo,
  fadeIn,
  fadeUp,
  routeTransition,
  slideDown,
  staggerContainer,
} from './motion';

describe('motion variants', () => {
  it('fadeUp hides then shows with a vertical offset', () => {
    expect(fadeUp.hidden).toMatchObject({ opacity: 0, y: 16 });
    expect(fadeUp.show).toMatchObject({ opacity: 1, y: 0 });
  });

  it('fadeIn toggles opacity only', () => {
    expect(fadeIn.hidden).toMatchObject({ opacity: 0 });
    expect(fadeIn.show).toMatchObject({ opacity: 1 });
  });

  it('slideDown enters from above', () => {
    expect(slideDown.hidden).toMatchObject({ opacity: 0, y: -16 });
    expect(slideDown.show).toMatchObject({ opacity: 1, y: 0 });
  });

  it('easeOutExpo is a cubic-bezier tuple', () => {
    expect(easeOutExpo).toEqual([0.22, 1, 0.36, 1]);
  });

  it('routeTransition defines initial / enter / exit states', () => {
    expect(routeTransition.initial).toBeDefined();
    expect(routeTransition.enter).toBeDefined();
    expect(routeTransition.exit).toBeDefined();
  });
});

describe('staggerContainer', () => {
  it('uses the default stagger and delay', () => {
    expect(staggerContainer().show).toMatchObject({
      transition: { staggerChildren: 0.06, delayChildren: 0 },
    });
  });

  it('honours custom stagger and delay values', () => {
    expect(staggerContainer(0.1, 0.2).show).toMatchObject({
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    });
  });
});
