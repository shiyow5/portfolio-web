import React from 'react';
import { motion } from 'motion/react';

interface PixelCharacterProps {
  scale?: number;
  animation?: 'idle' | 'walk' | 'jump';
}

/**
 * A cute chibi pixel character rendered using CSS box-shadow.
 * 16x16 grid.
 */
export const PixelCharacter: React.FC<PixelCharacterProps> = ({ scale = 4, animation = 'idle' }) => {
  // Simple 16x16 character map
  // . = transparent, K = Black, W = White, S = Skin, B = Blue (Clothes), R = Red (Hair/Hat)
  const frames = {
    idle: [
      ".......RRRRR.....",
      ".....RRRRRRRRR...",
      "....RRRRRRRRRRR..",
      "....RRRRRRRRRRR..",
      "....RRRSSSSSRRR..",
      "....RRSSSSSSSRR..",
      "....RRSSKSSKSSR..",
      "....RRSSSSSSSRR..",
      ".....SSSSSSSSS...",
      "......BBBBBBB....",
      ".....BBBBBBBBB...",
      ".....BBBBBBBBB...",
      ".....BBBBBBBBB...",
      "......KK...KK....",
      "......KK...KK....",
      "................."
    ],
    walk1: [
      ".......RRRRR.....",
      ".....RRRRRRRRR...",
      "....RRRRRRRRRRR..",
      "....RRRRRRRRRRR..",
      "....RRRSSSSSRRR..",
      "....RRSSSSSSSRR..",
      "....RRSSKSSKSSR..",
      "....RRSSSSSSSRR..",
      ".....SSSSSSSSS...",
      "......BBBBBBB....",
      ".....BBBBBBBBB...",
      ".....BBBBBBBBB...",
      ".....BBBBBBBBB...",
      ".......KK..KK....",
      ".......KK..KK....",
      "................."
    ],
    walk2: [
      ".......RRRRR.....",
      ".....RRRRRRRRR...",
      "....RRRRRRRRRRR..",
      "....RRRRRRRRRRR..",
      "....RRRSSSSSRRR..",
      "....RRSSSSSSSRR..",
      "....RRSSKSSKSSR..",
      "....RRSSSSSSSRR..",
      ".....SSSSSSSSS...",
      "......BBBBBBB....",
      ".....BBBBBBBBB...",
      ".....BBBBBBBBB...",
      ".....BBBBBBBBB...",
      "......KK..KK.....",
      "......KK..KK.....",
      "................."
    ]
  };

  const colors: Record<string, string> = {
    'R': '#ff004d', // Red
    'S': '#ffccaa', // Skin
    'K': '#000000', // Black
    'W': '#ffffff', // White
    'B': '#29adff', // Blue
    '.': 'transparent'
  };

  const generateBoxShadow = (frame: string[]) => {
    let shadow = "";
    for (let y = 0; y < frame.length; y++) {
      for (let x = 0; x < frame[y].length; x++) {
        const char = frame[y][x];
        if (char !== '.') {
          shadow += `${x + 1}px ${y + 1}px 0 0 ${colors[char]},`;
        }
      }
    }
    return shadow.slice(0, -1);
  };

  const [currentFrame, setCurrentFrame] = React.useState(0);

  React.useEffect(() => {
    if (animation === 'walk') {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev === 1 ? 2 : 1));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setCurrentFrame(0);
    }
  }, [animation]);

  const frameKey = animation === 'walk' ? (currentFrame === 1 ? 'walk1' : 'walk2') : 'idle';

  return (
    <motion.div
      style={{
        width: '1px',
        height: '1px',
        boxShadow: generateBoxShadow(frames[frameKey as keyof typeof frames] || frames.idle),
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      className="pixel-character"
    />
  );
};
