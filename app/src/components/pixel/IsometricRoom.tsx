import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface IsometricRoomProps {
  children?: ReactNode;
  color?: string;
  title?: string;
  onClick?: () => void;
  size?: number;
}

/**
 * CSS 3D-transform based isometric "room" container.
 * Uses 16-Bit Atelier tertiary border (wood tone) instead of black 1px lines.
 */
export function IsometricRoom({
  children,
  color = '#a5c1ff',
  title,
  onClick,
  size = 300,
}: IsometricRoomProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -8, scale: 1.02 } : {}}
      onClick={onClick}
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Floor */}
        <div
          className="absolute origin-center"
          style={{
            width: `${size * 0.66}px`,
            height: `${size * 0.66}px`,
            backgroundColor: color,
            transform: 'rotateX(60deg) rotateZ(45deg)',
            border: '4px solid var(--color-tertiary)',
            boxShadow: 'inset 0 0 0 4px rgba(126,87,46,0.12), 8px 8px 0 rgba(126,87,46,0.2)',
          }}
        />
        {/* Left wall */}
        <div
          className="absolute"
          style={{
            width: `${size * 0.66}px`,
            height: `${size * 0.5}px`,
            backgroundColor: color,
            filter: 'brightness(0.85)',
            transform: 'rotateX(60deg) rotateZ(45deg) rotateY(-90deg)',
            transformOrigin: 'bottom left',
            bottom: '50%',
            left: '50%',
            border: '4px solid var(--color-tertiary)',
          }}
        />
        {/* Right wall */}
        <div
          className="absolute"
          style={{
            width: `${size * 0.66}px`,
            height: `${size * 0.5}px`,
            backgroundColor: color,
            filter: 'brightness(0.92)',
            transform: 'rotateX(60deg) rotateZ(45deg) rotateX(-90deg)',
            transformOrigin: 'bottom right',
            bottom: '50%',
            right: '50%',
            border: '4px solid var(--color-tertiary)',
          }}
        />
        {/* Contents */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">{children}</div>
        </div>
        {/* Title */}
        {title && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="font-black text-xs bg-tertiary text-on-tertiary px-3 py-1 uppercase tracking-widest">
              {title}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
