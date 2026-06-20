import { describe, expect, it } from 'vitest';
import { CATEGORY_LABEL, WORKS, filterByCategory, findWork, listCategories } from './works';

describe('WORKS catalogue', () => {
  it('exposes a non-empty list', () => {
    expect(WORKS.length).toBeGreaterThan(0);
  });

  it('gives every work the expected shape', () => {
    for (const work of WORKS) {
      expect(work.id).toBeTruthy();
      expect(work.title).toBeTruthy();
      expect(['game', 'uiux', 'web', 'art', 'prototype']).toContain(work.category);
      expect(['new', 'stable', 'wip']).toContain(work.status);
      expect(typeof work.year).toBe('number');
      expect(Array.isArray(work.tags)).toBe(true);
    }
  });

  it('uses unique ids', () => {
    const ids = WORKS.map((work) => work.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('findWork', () => {
  it('returns undefined for an undefined id', () => {
    expect(findWork(undefined)).toBeUndefined();
  });

  it('returns undefined for an unknown id', () => {
    expect(findWork('does-not-exist')).toBeUndefined();
  });

  it('returns the matching work for a known id', () => {
    const first = WORKS[0];
    expect(findWork(first.id)).toEqual(first);
  });
});

describe('filterByCategory', () => {
  it('returns the full catalogue for "all"', () => {
    expect(filterByCategory('all')).toEqual(WORKS);
  });

  it('returns only works in the requested category', () => {
    const category = WORKS[0].category;
    const filtered = filterByCategory(category);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((work) => work.category === category)).toBe(true);
  });
});

describe('listCategories', () => {
  it('always starts with "all"', () => {
    expect(listCategories()[0]).toBe('all');
  });

  it('includes every category present in the catalogue, without duplicates', () => {
    const categories = listCategories();
    expect(new Set(categories).size).toBe(categories.length);
    for (const work of WORKS) {
      expect(categories).toContain(work.category);
    }
  });

  it('sorts the categories after "all" alphabetically', () => {
    const [, ...rest] = listCategories();
    expect(rest).toEqual([...rest].sort());
  });
});

describe('CATEGORY_LABEL', () => {
  it('has a label for "all" and every category in use', () => {
    expect(CATEGORY_LABEL.all).toBeTruthy();
    for (const work of WORKS) {
      expect(CATEGORY_LABEL[work.category]).toBeTruthy();
    }
  });
});
