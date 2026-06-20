import { describe, expect, it } from 'vitest';
import {
  ACTIVITIES,
  CATEGORY_COLOR,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  formatDate,
  groupByYear,
} from './activity';

describe('ACTIVITIES', () => {
  it('is sorted by date descending (newest first)', () => {
    for (let i = 0; i < ACTIVITIES.length - 1; i += 1) {
      expect(ACTIVITIES[i].date >= ACTIVITIES[i + 1].date).toBe(true);
    }
  });

  it('uses unique ids', () => {
    const ids = ACTIVITIES.map((activity) => activity.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('formatDate', () => {
  it('renders an ISO date as dotted segments', () => {
    expect(formatDate('2026-04-22')).toBe('2026.04.22');
  });
});

describe('groupByYear', () => {
  it('orders the year groups descending', () => {
    const years = groupByYear().map((group) => group.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it('keeps every activity exactly once', () => {
    const total = groupByYear().reduce((sum, group) => sum + group.entries.length, 0);
    expect(total).toBe(ACTIVITIES.length);
  });

  it('places each entry in the bucket matching its date year', () => {
    for (const group of groupByYear()) {
      for (const entry of group.entries) {
        expect(Number.parseInt(entry.date.slice(0, 4), 10)).toBe(group.year);
      }
    }
  });
});

describe('category lookup tables', () => {
  const categories = ['project', 'release', 'talk', 'award', 'job', 'post'] as const;

  it('provides a label, icon and colour for every category', () => {
    for (const category of categories) {
      expect(CATEGORY_LABEL[category]).toBeTruthy();
      expect(CATEGORY_ICON[category]).toBeTruthy();
      expect(CATEGORY_COLOR[category]).toBeTruthy();
    }
  });
});
