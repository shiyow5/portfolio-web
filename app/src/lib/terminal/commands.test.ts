import { describe, expect, it } from 'vitest';
import { WORKS } from '../works';
import { PROFILE } from '../profile';
import { ACTIVITIES } from '../activity';
import { runCommand, type CmdCtx } from './commands';

const ctx: CmdCtx = { works: WORKS, profile: PROFILE, activities: ACTIVITIES };
const run = (input: string) => runCommand(input, ctx);
const flat = (input: string) =>
  run(input)
    .lines.map((l) => l.text)
    .join('\n');

describe('runCommand', () => {
  it('ignores empty input', () => {
    expect(run('   ').lines).toEqual([]);
    expect(run('   ').action).toBeUndefined();
  });

  it('help lists commands', () => {
    expect(flat('help')).toMatch(/ask/);
    expect(flat('?')).toMatch(/whoami/);
  });

  it('whoami shows the profile name', () => {
    expect(flat('whoami')).toContain(PROFILE.name);
  });

  it('unknown command errors with a hint', () => {
    const r = run('foobar');
    expect(r.lines[0]!.tone).toBe('error');
    expect(r.lines[0]!.text).toMatch(/command not found/);
  });

  it('clear / editorial / chat emit actions', () => {
    expect(run('clear').action).toEqual({ type: 'clear' });
    expect(run('editorial').action).toEqual({ type: 'mode' });
    expect(run('chat').action).toEqual({ type: 'openChat' });
  });

  it('ask carries the question as an action', () => {
    expect(run('ask RAGの経験は？').action).toEqual({ type: 'ask', question: 'RAGの経験は？' });
    expect(run('ask').action).toBeUndefined(); // usage hint, no action
  });

  it('ls projects/ lists every work id', () => {
    const out = flat('ls projects/');
    for (const w of WORKS) expect(out).toContain(`${w.id}/`);
  });

  it('cat projects/<id> shows the work, unknown file errors', () => {
    expect(flat('cat projects/fastbear')).toContain('FASTBEAR');
    expect(run('cat nope.txt').lines[0]!.tone).toBe('error');
  });

  it('open resolves a work url or errors', () => {
    const dm = run('open dm-ai');
    expect(dm.action).toEqual({ type: 'open', url: 'https://github.com/shiyow5/DuelMasters-AI' });
    expect(run('open ghost').lines[0]!.tone).toBe('error');
  });

  it('sudo is a friendly easter egg', () => {
    expect(flat('sudo rm -rf /')).toMatch(/sudoers/);
  });

  it('man lists the manual and details a command', () => {
    expect(flat('man')).toMatch(/ask/);
    expect(flat('man ask')).toMatch(/USAGE/);
    expect(run('man nope').lines[0]!.tone).toBe('error');
  });

  it('sl emits the train action', () => {
    expect(run('sl').action).toEqual({ type: 'sl' });
  });

  it('ls errors on an invalid argument (typo)', () => {
    expect(run('ls projets/').lines[0]!.tone).toBe('error');
    expect(flat('ls')).toContain('projects/');
    expect(flat('ls projects/')).toContain('astralyx/');
  });
});
