import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PixelCharacter } from './components/PixelCharacter';
import { RetroWindow } from './components/RetroWindow';
import { GameGallery } from './components/GameGallery';
import { IsometricRoom } from './components/IsometricRoom';
import { User, Gamepad2, Code2, Mail, Home, ArrowRight, Laptop, Music, Dumbbell, BookOpen } from 'lucide-react';

type Screen = 'START' | 'MENU' | 'ABOUT' | 'WORKS' | 'SKILLS' | 'CONTACT';

export default function App() {
  const [screen, setScreen] = useState<Screen>('START');
  const [activeRoom, setActiveRoom] = useState<Screen | null>(null);

  const rooms = [
    { id: 'ABOUT', title: 'ABOUT ME', color: '#88ccff', icon: <User size={32} />, activity: 'Self Intro' },
    { id: 'WORKS', title: 'WORKS', color: '#ffaa88', icon: <Gamepad2 size={32} />, activity: 'Game Dev' },
    { id: 'SKILLS', title: 'SKILLS', color: '#aaff88', icon: <Code2 size={32} />, activity: 'Coding' },
    { id: 'CONTACT', title: 'CONTACT', color: '#ff88cc', icon: <Mail size={32} />, activity: 'Mail' },
  ];

  const renderActiveContent = () => {
    switch (activeRoom) {
      case 'ABOUT':
        return (
          <RetroWindow title="ABOUT ME" onClose={() => setActiveRoom(null)}>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 bg-pixel-accent pixel-border flex items-center justify-center shrink-0">
                  <User size={48} className="text-white" />
                </div>
                <div>
                  <h2 className="font-pixel text-pixel-secondary text-[16px] mb-2">PIXEL DESIGNER</h2>
                  <p className="text-sm leading-relaxed">
                    こんにちは！ドット絵とインディーゲームが大好きなデザイナーです。
                    アイソメトリック（等角投影法）な世界観を構築するのが得意です。
                  </p>
                </div>
              </div>
            </div>
          </RetroWindow>
        );
      case 'WORKS':
        return (
          <RetroWindow title="GAME GALLERY" onClose={() => setActiveRoom(null)} className="max-w-4xl w-full">
            <GameGallery />
          </RetroWindow>
        );
      case 'SKILLS':
        return (
          <RetroWindow title="SKILLS & TOOLS" onClose={() => setActiveRoom(null)}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Pixel Art', level: 90, color: 'bg-pixel-primary' },
                { name: 'UI Design', level: 85, color: 'bg-pixel-secondary' },
                { name: 'Unity/C#', level: 70, color: 'bg-pixel-accent' },
                { name: 'React/TS', level: 80, color: 'bg-yellow-400' },
              ].map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-pixel">
                    <span>{skill.name}</span>
                    <span>{skill.level}%</span>
                  </div>
                  <div className="h-4 bg-black pixel-border p-[2px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      className={`h-full ${skill.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </RetroWindow>
        );
      case 'CONTACT':
        return (
          <RetroWindow title="SEND MESSAGE" onClose={() => setActiveRoom(null)}>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="NAME" className="w-full bg-black border-2 border-gray-700 p-2 font-dot text-sm focus:border-pixel-secondary outline-none" />
              <textarea rows={3} placeholder="MESSAGE" className="w-full bg-black border-2 border-gray-700 p-2 font-dot text-sm focus:border-pixel-secondary outline-none" />
              <button className="pixel-button w-full bg-pixel-secondary text-black">SEND DATA</button>
            </form>
          </RetroWindow>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#e0e0e0]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <AnimatePresence mode="wait">
        {screen === 'START' ? (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 z-10"
          >
            <h1 className="font-pixel text-4xl md:text-6xl text-black drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              ISOMETRIC<br />PORTFOLIO
            </h1>
            <button 
              onClick={() => setScreen('MENU')}
              className="pixel-button bg-black text-white px-12 py-4 text-lg"
            >
              ENTER WORLD
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl z-10"
          >
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-20 py-12">
              {rooms.map((room) => (
                <div key={room.id} className="relative">
                  <IsometricRoom 
                    title={room.title} 
                    color={room.color}
                    onClick={() => setActiveRoom(room.id as Screen)}
                    isActive={activeRoom === room.id}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="mb-4 text-black/40">
                        {room.icon}
                      </div>
                      <PixelCharacter scale={3} animation="idle" />
                      <span className="font-dot text-[12px] font-bold mt-2 text-black/60">{room.activity}</span>
                    </div>
                  </IsometricRoom>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setScreen('START')}
                className="pixel-button bg-white text-black flex items-center gap-2 mx-auto"
              >
                <Home size={16} /> TITLE SCREEN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            {renderActiveContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <div className="fixed bottom-4 left-4 font-pixel text-[8px] text-gray-400">
        ISOMETRIC MODE ACTIVE
      </div>
    </div>
  );
}
