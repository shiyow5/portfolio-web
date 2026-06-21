import { describe, expect, it } from 'vitest';
import { resolveCitation } from './citationLinks';

describe('resolveCitation', () => {
  it('links a work with a URL out to its source (external)', () => {
    const c = resolveCitation('work:fastbear', 'editorial');
    expect(c?.external).toBe(true);
    expect(c?.href).toMatch(/^https?:\/\//);
    expect(c?.slug).toBe('fastbear');
  });

  it('links a work without any URL to the in-page work section (per mode)', () => {
    expect(resolveCitation('work:llm-kv-cache', 'editorial')?.href).toBe('#work');
    expect(resolveCitation('work:llm-kv-cache', 'terminal')?.href).toBe('#projects');
    expect(resolveCitation('work:llm-kv-cache', 'editorial')?.external).toBe(false);
  });

  it('links an activity with a source URL externally', () => {
    const c = resolveCitation('act:astralyx-award', 'editorial');
    expect(c?.external).toBe(true);
    expect(c?.href).toContain('gdg.community.dev');
  });

  it('links a link-less activity to the activity section', () => {
    expect(resolveCitation('act:matsuo-intern', 'terminal')?.href).toBe('#activity');
  });

  it('links a profile group to the stack/skills section per mode', () => {
    expect(resolveCitation('prof:ai', 'editorial')?.href).toBe('#stack');
    expect(resolveCitation('prof:ai', 'terminal')?.href).toBe('#skills');
  });

  it('returns null for unknown ids and malformed tokens', () => {
    expect(resolveCitation('work:does-not-exist', 'editorial')).toBeNull();
    expect(resolveCitation('not-a-citation', 'editorial')).toBeNull();
    expect(resolveCitation('prof:identity', 'editorial')?.href).toBe('#stack');
  });
});
