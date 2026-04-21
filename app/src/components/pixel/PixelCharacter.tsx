import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

type Animation = 'idle' | 'walk' | 'wave';

interface PixelCharacterProps {
  scale?: number;
  animation?: Animation;
  className?: string;
  ariaLabel?: string;
}

/**
 * 2頭身 (2-head tall) chibi character. 16x16 pixel grid rendered via CSS box-shadow.
 * Palette re-tuned for 16-Bit Atélier (cream surface + wood/primary accents).
 *
 * Legend:
 *   H = hair / hat   (tertiary / wood)
 *   S = skin
 *   K = outline / eyes
 *   C = shirt        (primary / sky)
 *   P = pants        (on-surface / deep)
 *   A = apron / accent (tertiary-container)
 */

const FRAME_IDLE = [
  '.......HHHHH....',
  '.....HHHHHHHHH..',
  '....HHHHHHHHHHH.',
  '....HHHHHHHHHHH.',
  '....HHHSSSSSHHH.',
  '....HHSSSSSSSHH.',
  '....HHSSKSSKSSH.',
  '....HHSSSSSSSHH.',
  '.....SSSSSSSSS..',
  '......CCCCCCC...',
  '.....CCCAACCC...',
  '.....CCCAACCC...',
  '.....CCCCCCCCC..',
  '......PP..PP....',
  '......PP..PP....',
  '................',
];

const FRAME_WALK1 = [
  '.......HHHHH....',
  '.....HHHHHHHHH..',
  '....HHHHHHHHHHH.',
  '....HHHHHHHHHHH.',
  '....HHHSSSSSHHH.',
  '....HHSSSSSSSHH.',
  '....HHSSKSSKSSH.',
  '....HHSSSSSSSHH.',
  '.....SSSSSSSSS..',
  '......CCCCCCC...',
  '.....CCCAACCC...',
  '.....CCCAACCC...',
  '.....CCCCCCCCC..',
  '.......PP.PP....',
  '.......PP.PP....',
  '................',
];

const FRAME_WALK2 = [
  '.......HHHHH....',
  '.....HHHHHHHHH..',
  '....HHHHHHHHHHH.',
  '....HHHHHHHHHHH.',
  '....HHHSSSSSHHH.',
  '....HHSSSSSSSHH.',
  '....HHSSKSSKSSH.',
  '....HHSSSSSSSHH.',
  '.....SSSSSSSSS..',
  '......CCCCCCC...',
  '.....CCCAACCC...',
  '.....CCCAACCC...',
  '.....CCCCCCCCC..',
  '......PP.PP.....',
  '......PP.PP.....',
  '................',
];

const FRAME_WAVE = [
  '.......HHHHH....',
  '.....HHHHHHHHH..',
  '...S.HHHHHHHHHH.',
  '...S.HHHHHHHHHH.',
  '...S.HHSSSSSHHH.',
  '....SSSSSSSSSHH.',
  '....HHSSKSSKSSH.',
  '....HHSSSSSSSHH.',
  '.....SSSSSSSSS..',
  '......CCCCCCC...',
  '.....CCCAACCC...',
  '.....CCCAACCC...',
  '.....CCCCCCCCC..',
  '......PP..PP....',
  '......PP..PP....',
  '................',
];

const COLORS: Record<string, string> = {
  H: '#7e572e', // tertiary (wood)
  S: '#f5d4b3', // warm skin
  K: '#31332e', // on-surface (outline)
  C: '#005bc3', // primary (sky blue shirt)
  A: '#e1af7e', // tertiary-container (apron)
  P: '#3a2e20', // dark legs
  '.': 'transparent',
};

function toBoxShadow(frame: string[]): string {
  const parts: string[] = [];
  for (let y = 0; y < frame.length; y++) {
    const row = frame[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const color = COLORS[ch];
      if (ch === '.' || !color) continue;
      parts.push(`${x + 1}px ${y + 1}px 0 0 ${color}`);
    }
  }
  return parts.join(',');
}

export function PixelCharacter({
  scale = 4,
  animation = 'idle',
  className,
  ariaLabel = 'Pixel character',
}: PixelCharacterProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (animation === 'idle') return;
    const interval = animation === 'walk' ? 180 : 280;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [animation]);

  let frame = FRAME_IDLE;
  if (animation === 'walk') {
    frame = tick % 2 === 0 ? FRAME_WALK1 : FRAME_WALK2;
  } else if (animation === 'wave') {
    frame = tick % 2 === 0 ? FRAME_WAVE : FRAME_IDLE;
  }

  return (
    <motion.div
      aria-label={ariaLabel}
      role="img"
      className={className}
      style={{
        width: `${16 * scale}px`,
        height: `${16 * scale}px`,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '1px',
          height: '1px',
          boxShadow: toBoxShadow(frame),
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </motion.div>
  );
}
