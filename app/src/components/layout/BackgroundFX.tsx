import { useMemo } from 'react';

type Particle = {
  left: string;
  duration: string;
  delay: string;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    left: `${(i * 97 + 13) % 100}%`,
    duration: `${18 + ((i * 7) % 15)}s`,
    delay: `${(i * 3) % 12}s`,
  }));
}

export function BackgroundFX() {
  const particles = useMemo(() => makeParticles(12), []);

  return (
    <>
      <div className="retro-bg" aria-hidden />
      <div className="scanlines" aria-hidden />
      <div className="pixel-particles" aria-hidden>
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
    </>
  );
}
