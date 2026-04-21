import type { ReactNode } from 'react';

interface DialogueBoxProps {
  children: ReactNode;
  speaker?: string;
  className?: string;
}

/**
 * Tertiary-container background + 4px tertiary border.
 * Per design guide: character chibi assets should "break the container" by
 * overlapping the top-left corner, creating life and movement.
 */
export function DialogueBox({ children, speaker, className }: DialogueBoxProps) {
  return (
    <div
      className={[
        'relative bg-tertiary-container border-4 border-tertiary',
        'shadow-[4px_4px_0_0_rgba(126,87,46,0.3)]',
        'p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {speaker && (
        <div className="text-[10px] uppercase font-black tracking-widest text-tertiary-dim mb-2">
          {speaker}
        </div>
      )}
      <div className="text-on-tertiary-container font-bold text-sm leading-relaxed">{children}</div>
      {/* pointer tail */}
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-tertiary-container border-r-4 border-b-4 border-tertiary rotate-45" />
    </div>
  );
}
