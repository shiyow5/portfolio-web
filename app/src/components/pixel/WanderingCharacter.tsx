import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type Emote = 'wave' | 'jump' | 'spin' | 'ponder' | 'stretch';

export interface Spot {
  id: string;
  left: number;
  top: number;
  emote: Emote;
  pause: number;
}

const DEFAULT_SPOTS: Spot[] = [
  { id: 'tv', left: 30, top: 68, emote: 'stretch', pause: 2200 },
  { id: 'rug', left: 50, top: 78, emote: 'wave', pause: 1800 },
  { id: 'table', left: 65, top: 68, emote: 'ponder', pause: 2400 },
  { id: 'corner-near', left: 68, top: 87, emote: 'jump', pause: 1500 },
  { id: 'corner-far', left: 32, top: 87, emote: 'spin', pause: 2000 },
];

const EMOTE_BUBBLE: Record<Emote, string> = {
  wave: '👋',
  jump: '⬆',
  spin: '✨',
  ponder: '…',
  stretch: '💪',
};

const WALK_SPEED_PCT_PER_SEC = 14;
const EMOTE_DURATION_MS = 900;

function distancePct(a: Spot, b: Spot): number {
  return Math.hypot(a.left - b.left, a.top - b.top);
}

function pickNext(current: Spot, spots: Spot[]): Spot {
  const others = spots.filter((s) => s.id !== current.id);
  return others[Math.floor(Math.random() * others.length)]!;
}

type Phase = 'resting' | 'walking' | 'emoting';

interface WanderingCharacterProps {
  src: string;
  alt?: string;
  width?: number;
  spots?: Spot[];
}

export function WanderingCharacter({
  src,
  alt = 'shiyow wandering around the room',
  width = 22,
  spots = DEFAULT_SPOTS,
}: WanderingCharacterProps) {
  const reduceMotion = useReducedMotion();

  const initialSpot = spots[0]!;
  const [current, setCurrent] = useState<Spot>(initialSpot);
  const [previous, setPrevious] = useState<Spot>(initialSpot);
  const [phase, setPhase] = useState<Phase>('resting');
  const [facing, setFacing] = useState<1 | -1>(1);

  const walkDuration = useMemo(() => {
    const d = distancePct(previous, current);
    return Math.max(0.6, d / WALK_SPEED_PCT_PER_SEC);
  }, [previous, current]);

  useEffect(() => {
    if (reduceMotion) return;
    const state = { cancelled: false };

    function schedule(ms: number, fn: () => void) {
      const t = setTimeout(() => {
        if (!state.cancelled) fn();
      }, ms);
      return () => {
        state.cancelled = true;
        clearTimeout(t);
      };
    }

    if (phase === 'resting') {
      return schedule(current.pause, () => {
        const next = pickNext(current, spots);
        const dx = next.left - current.left;
        setPrevious(current);
        setCurrent(next);
        if (dx !== 0) setFacing(dx > 0 ? 1 : -1);
        setPhase('walking');
      });
    }

    if (phase === 'walking') {
      return schedule(walkDuration * 1000, () => setPhase('emoting'));
    }

    return schedule(EMOTE_DURATION_MS, () => setPhase('resting'));
  }, [phase, current, spots, walkDuration, reduceMotion]);

  if (reduceMotion) {
    return (
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute pixelated pointer-events-none"
        style={{
          width: `${width}%`,
          left: `${initialSpot.left}%`,
          top: `${initialSpot.top}%`,
          transform: 'translate(-50%, -100%)',
        }}
      />
    );
  }

  const isWalking = phase === 'walking';
  const isEmoting = phase === 'emoting';

  const emoteAnim: Record<Emote, Record<string, number | number[]>> = {
    wave: { rotate: [0, -12, 12, -8, 0], y: 0 },
    jump: { y: [0, -22, 0, -12, 0], rotate: 0 },
    spin: { rotate: [0, 360], y: 0 },
    ponder: { x: [0, -3, 3, 0], rotate: [0, -5, 5, 0], y: 0 },
    stretch: { scaleY: [1, 1.08, 0.95, 1], y: [0, -4, 0] },
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: `${width}%`,
        left: `${current.left}%`,
        top: `${current.top}%`,
        transform: 'translate(-50%, -100%)',
        transition: `left ${walkDuration}s linear, top ${walkDuration}s linear`,
        zIndex: 5,
      }}
    >
      <motion.div
        animate={{
          scaleX: facing,
          ...(isWalking
            ? { y: [0, -4, 0, -4, 0], rotate: 0 }
            : isEmoting
              ? emoteAnim[current.emote]
              : { y: [0, -2, 0], rotate: 0 }),
        }}
        transition={
          isWalking
            ? {
                y: { duration: 0.35, repeat: Infinity, ease: 'easeInOut' },
                scaleX: { duration: 0.2 },
              }
            : isEmoting
              ? { duration: 0.8, ease: 'easeInOut' }
              : {
                  y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                  scaleX: { duration: 0.2 },
                }
        }
      >
        <img src={src} alt={alt} draggable={false} className="pixelated w-full h-auto" />
      </motion.div>

      <AnimatePresence>
        {isEmoting && (
          <motion.div
            key={`${current.id}-bubble`}
            initial={{ opacity: 0, y: 4, scale: 0.6 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.7 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 -top-6 -translate-x-1/2 bg-surface-container-lowest pixel-border-thin px-2 py-0.5 text-sm font-black select-none"
          >
            {EMOTE_BUBBLE[current.emote]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
