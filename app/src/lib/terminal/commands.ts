/**
 * Command interpreter for the interactive terminal. `runCommand` is pure: it
 * takes the typed input + data context and returns output lines plus an optional
 * action for the REPL to perform (clear / switch mode / open chat / open url /
 * ask the AI clone). Kept side-effect-free so it can be unit-tested.
 */
import type { Work } from '../works';
import type { Profile } from '../profile';
import type { Activity } from '../activity';
import { formatDate } from '../activity';

export type Tone = 'default' | 'muted' | 'green' | 'accent' | 'orange' | 'purple' | 'error';

export interface Line {
  text: string;
  tone?: Tone;
  href?: string;
}

export type CmdAction =
  | { type: 'clear' }
  | { type: 'mode' }
  | { type: 'openChat' }
  | { type: 'open'; url: string }
  | { type: 'ask'; question: string };

export interface CmdResult {
  lines: Line[];
  action?: CmdAction;
}

export interface CmdCtx {
  works: Work[];
  profile: Profile;
  activities: Activity[];
}

export const COMMANDS = [
  'help',
  'whoami',
  'neofetch',
  'ls',
  'cat',
  'projects',
  'skills',
  'activity',
  'open',
  'ask',
  'chat',
  'contact',
  'social',
  'editorial',
  'clear',
  'echo',
  'sudo',
  'cowsay',
] as const;

const t = (text: string, tone?: Tone, href?: string): Line => ({ text, tone, href });

function workById(ctx: CmdCtx, id: string): Work | undefined {
  return ctx.works.find((w) => w.id === id.replace(/^projects\//, '').replace(/\/$/, ''));
}

function workLine(w: Work): Line {
  return t(`${w.id.padEnd(16)} ${w.title} — ${w.status} (${w.year})`, 'default');
}

function help(): Line[] {
  return [
    t('Available commands:', 'muted'),
    t('  help              このヘルプ'),
    t('  whoami / neofetch プロフィール'),
    t('  ls [projects/]    一覧'),
    t('  cat <file>        mission.txt / contact.sh / projects/<id>'),
    t('  projects          作品一覧'),
    t('  skills            技術スタック'),
    t('  activity          タイムライン'),
    t('  open <id>         作品のリンクを開く'),
    t('  ask <質問>        AIクローンに質問（回答をここに表示）', 'accent'),
    t('  chat              クローンのチャットを開く'),
    t('  contact / social  連絡先・SNS'),
    t('  editorial         エディトリアル表示へ切替'),
    t('  clear             画面クリア'),
    t('  …ほかにも隠しコマンドが少々 😏', 'muted'),
  ];
}

function neofetch(ctx: CmdCtx): Line[] {
  const p = ctx.profile;
  const art = ['   ╔═╗╦ ╦╦╦ ╦╔═╗╦ ╦', '   ╚═╗╠═╣║╚╦╝║ ║║║║', '   ╚═╝╩ ╩╩ ╩ ╚═╝╚╩╝'];
  const info = [
    `${p.name} @ shiyow.dev`,
    '─────────────────',
    `Role   : ${p.classTitle}`,
    `Loc    : ${p.location}`,
    `Works  : ${ctx.works.length}`,
    `Stack  : ${p.techStack.map((g) => g.label).join(', ')}`,
    `Status : open to work`,
  ];
  const rows = Math.max(art.length, info.length);
  const lines: Line[] = [];
  for (let i = 0; i < rows; i++) {
    const left = (art[i] ?? '').padEnd(22);
    lines.push(t(`${left}${info[i] ?? ''}`, i < art.length ? 'accent' : 'default'));
  }
  return lines;
}

export function runCommand(input: string, ctx: CmdCtx): CmdResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };
  const [cmd, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(' ');
  const name = (cmd ?? '').toLowerCase();

  switch (name) {
    case 'help':
    case '?':
      return { lines: help() };

    case 'whoami':
      return {
        lines: [
          t(`${ctx.profile.name} — ${ctx.profile.classTitle}`),
          t(`LLM / Agent / RAG / ML · ${ctx.profile.location}`, 'muted'),
        ],
      };

    case 'neofetch':
      return { lines: neofetch(ctx) };

    case 'ls': {
      if (/^projects\/?$/.test(arg)) {
        return { lines: ctx.works.map((w) => t(`${w.id}/`, 'purple')) };
      }
      return {
        lines: [t('home.tsx  projects/  skills.json  activity.log  contact.sh', 'muted')],
      };
    }

    case 'projects':
      return { lines: ctx.works.map(workLine) };

    case 'skills':
      return {
        lines: ctx.profile.techStack.map((g) => t(`${g.label}: ${g.items.join(', ')}`)),
      };

    case 'activity':
      return {
        lines: ctx.activities.map((a) => t(`${formatDate(a.date)}  ${a.title}`)),
      };

    case 'cat': {
      if (!arg)
        return {
          lines: [t('usage: cat <file>  (mission.txt / contact.sh / projects/<id>)', 'muted')],
        };
      if (arg === 'mission.txt')
        return { lines: [t('LLM アプリ・AI エージェント・ML をプロダクトとして実装します。')] };
      if (arg === 'status.txt' || arg === 'contact.sh')
        return {
          lines: [
            t('◉ open to work — 就活中。カジュアル面談・選考歓迎。', 'green'),
            t('連絡: `contact` または `chat`、X @twinS_KNSN1415', 'muted'),
          ],
        };
      if (arg === 'skills.json') return runCommand('skills', ctx);
      const w = workById(ctx, arg);
      if (w) {
        const urls = [
          w.links.demo,
          w.links.github,
          w.links.play,
          ...(w.links.sources ?? []).map((s) => s.url),
        ].filter(Boolean) as string[];
        return {
          lines: [
            t(`${w.title} — ${w.status} (${w.year})`, 'accent'),
            t(`tech: ${w.tech.join(', ')}`, 'muted'),
            t(w.tagline),
            ...(urls.length ? [t(`links: ${urls.join('  ')}`, 'muted')] : []),
            t(`( open ${w.id} でリンクを開く )`, 'muted'),
          ],
        };
      }
      return { lines: [t(`cat: ${arg}: No such file`, 'error')] };
    }

    case 'open': {
      const w = workById(ctx, arg);
      const url =
        w && (w.links.demo ?? w.links.github ?? w.links.play ?? w.links.sources?.[0]?.url);
      if (!w)
        return { lines: [t(`open: ${arg}: 作品が見つかりません（projects で一覧）`, 'error')] };
      if (!url) return { lines: [t(`${w.title}: 公開リンクはありません`, 'muted')] };
      return { lines: [t(`opening ${url} …`, 'muted')], action: { type: 'open', url } };
    }

    case 'ask': {
      if (!arg) return { lines: [t('usage: ask <質問>  例: ask RAGの経験は？', 'muted')] };
      return { lines: [], action: { type: 'ask', question: arg } };
    }

    case 'chat':
    case 'clone':
      return { lines: [t('AI クローンを開きます…', 'muted')], action: { type: 'openChat' } };

    case 'contact':
      return {
        lines: [
          t('◉ open to work — カジュアル面談・選考歓迎。', 'green'),
          t('画面下部の contact.sh フォーム、または下記からどうぞ。', 'muted'),
          t('X: https://x.com/twinS_KNSN1415', 'default', 'https://x.com/twinS_KNSN1415'),
          t('GitHub: https://github.com/shiyow5', 'default', 'https://github.com/shiyow5'),
        ],
      };

    case 'social':
    case 'links':
      return {
        lines: [
          t('X      https://x.com/twinS_KNSN1415', 'default', 'https://x.com/twinS_KNSN1415'),
          t('GitHub https://github.com/shiyow5', 'default', 'https://github.com/shiyow5'),
          t('Kaggle https://www.kaggle.com/sshow14', 'default', 'https://www.kaggle.com/sshow14'),
        ],
      };

    case 'editorial':
    case 'theme':
      return { lines: [t('switching to editorial …', 'muted')], action: { type: 'mode' } };

    case 'clear':
    case 'cls':
      return { lines: [], action: { type: 'clear' } };

    case 'echo':
      return { lines: [t(arg)] };

    // ---- easter eggs ----
    case 'sudo':
      return {
        lines: [
          t('shiyow is not in the sudoers file. This incident will be reported. 😏', 'orange'),
        ],
      };

    case 'cowsay': {
      const msg = arg || 'moo';
      const bar = '─'.repeat(msg.length + 2);
      return {
        lines: [
          t(` ${bar}`),
          t(`< ${msg} >`),
          t(` ${bar}`),
          t('        \\   ^__^'),
          t('         \\  (oo)\\_______'),
          t('            (__)\\       )\\/\\'),
          t('                ||----w |'),
          t('                ||     ||'),
        ],
      };
    }

    case 'matrix':
      return { lines: [t('01001000 01101001 — Wake up, recruiter… 🟢', 'green')] };

    case 'rm':
      return {
        lines: [t('nice try — this portfolio is immutable. (git revert は受け付けます)', 'orange')],
      };

    case 'vim':
    case 'nano':
    case 'exit':
      return { lines: [t('そこは `chat` でクローンと話すのが早いですよ 🙂', 'muted')] };

    default:
      return { lines: [t(`command not found: ${name} — \`help\` でコマンド一覧`, 'error')] };
  }
}
