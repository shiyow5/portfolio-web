import React from 'react';
import { motion } from 'motion/react';
import { Play, ExternalLink, Github } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  links: {
    play?: string;
    github?: string;
    demo?: string;
  };
}

const GAMES: Game[] = [
  {
    id: '1',
    title: 'Pixel Quest',
    description: 'A retro-style RPG adventure with turn-based combat and a deep story.',
    image: 'https://picsum.photos/seed/pixel-game-1/400/250',
    tags: ['RPG', 'Pixel Art', 'Unity'],
    links: {
      play: '#',
      github: '#'
    }
  },
  {
    id: '2',
    title: 'Dot Dash',
    description: 'Fast-paced rhythmic platformer where every jump counts.',
    image: 'https://picsum.photos/seed/pixel-game-2/400/250',
    tags: ['Platformer', 'Rhythm', 'Godot'],
    links: {
      demo: '#',
      github: '#'
    }
  },
  {
    id: '3',
    title: 'Neon Void',
    description: 'Cyberpunk bullet-hell shooter with neon aesthetics and synthwave music.',
    image: 'https://picsum.photos/seed/pixel-game-3/400/250',
    tags: ['Shooter', 'Cyberpunk', 'C#'],
    links: {
      play: '#'
    }
  }
];

export const GameGallery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
      {GAMES.map((game) => (
        <motion.div
          key={game.id}
          whileHover={{ y: -5 }}
          className="pixel-border bg-[#3d3d3d] overflow-hidden flex flex-col"
        >
          <div className="relative h-40 bg-black">
            <img 
              src={game.image} 
              alt={game.title} 
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[8px] font-pixel">
              {game.tags[0]}
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-pixel text-[14px] mb-2 text-pixel-secondary">{game.title}</h3>
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{game.description}</p>
            
            <div className="mt-auto flex gap-2">
              {game.links.play && (
                <button className="pixel-button bg-pixel-primary text-white flex items-center gap-1 text-[8px]">
                  <Play size={12} /> PLAY
                </button>
              )}
              {game.links.github && (
                <button className="pixel-button bg-gray-700 text-white flex items-center gap-1 text-[8px]">
                  <Github size={12} /> CODE
                </button>
              )}
              {game.links.demo && (
                <button className="pixel-button bg-pixel-accent text-white flex items-center gap-1 text-[8px]">
                  <ExternalLink size={12} /> DEMO
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
