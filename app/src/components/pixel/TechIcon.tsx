import {
  siAnthropic,
  siCloudflare,
  siFigma,
  siFramer,
  siGit,
  siGithub,
  siGo,
  siGodotengine,
  siGooglecloud,
  siGooglegemini,
  siJavascript,
  siLangchain,
  siNodedotjs,
  siPython,
  siReact,
  siReactrouter,
  siTailwindcss,
  siTypescript,
  siUnity,
  siVercel,
  siVite,
} from 'simple-icons';

interface SIcon {
  path: string;
}

interface IconSpec {
  si?: SIcon;
  ms?: string;
}

/**
 * 技術名 → 表示アイコンのマップ。si は simple-icons の SVG path、
 * ms は Material Symbols の記号名 (brand logo が無いものの fallback)。
 */
const TECH_ICONS: Record<string, IconSpec> = {
  // Languages
  TypeScript: { si: siTypescript },
  JavaScript: { si: siJavascript },
  Python: { si: siPython },
  Go: { si: siGo },
  SQL: { ms: 'database' },

  // Frameworks & Runtime
  'React 19': { si: siReact },
  'Vite 6': { si: siVite },
  'Tailwind CSS v4': { si: siTailwindcss },
  Motion: { si: siFramer },
  'React Router': { si: siReactrouter },
  'Node.js': { si: siNodedotjs },

  // Design & Pixel Art
  Figma: { si: siFigma },
  FigJam: { si: siFigma },
  Aseprite: { ms: 'brush' },
  Photoshop: { ms: 'draw' },

  // Cloud & Infra
  'Cloudflare Pages': { si: siCloudflare },
  Workers: { si: siCloudflare },
  D1: { ms: 'database' },
  R2: { ms: 'cloud' },
  KV: { ms: 'key_vertical' },
  GCP: { si: siGooglecloud },
  Vercel: { si: siVercel },

  // AI & Agents
  'Gemini 2.0 Flash': { si: siGooglegemini },
  Claude: { si: siAnthropic },
  LangChain: { si: siLangchain },
  'Vectorize (Workers AI)': { ms: 'psychology' },

  // Game Dev
  Unity: { si: siUnity },
  Godot: { si: siGodotengine },

  // Tools
  'VS Code': { ms: 'code' },
  Git: { si: siGit },
  'gh CLI': { si: siGithub },
  tmux: { ms: 'terminal' },
  Wrangler: { si: siCloudflare },
};

interface TechIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function TechIcon({ name, size = 14, className }: TechIconProps) {
  const spec = TECH_ICONS[name];
  if (spec?.si) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden
        className={className}
      >
        <path d={spec.si.path} />
      </svg>
    );
  }
  if (spec?.ms) {
    return (
      <span
        className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
        style={{ fontSize: size }}
        aria-hidden
      >
        {spec.ms}
      </span>
    );
  }
  return (
    <span
      className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
      style={{ fontSize: size }}
      aria-hidden
    >
      circle
    </span>
  );
}
