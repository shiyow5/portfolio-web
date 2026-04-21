import React from 'react';
import { motion } from 'motion/react';

interface IsometricRoomProps {
  children: React.ReactNode;
  color?: string;
  title?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const IsometricRoom: React.FC<IsometricRoomProps> = ({ 
  children, 
  color = "#88ccff", 
  title, 
  onClick,
  isActive = false
}) => {
  return (
    <motion.div 
      whileHover={onClick ? { y: -10, scale: 1.02 } : {}}
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-500 ${isActive ? 'z-50' : 'z-10'}`}
      style={{
        width: '300px',
        height: '300px',
      }}
    >
      {/* Isometric Room Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Floor */}
        <div 
          className="absolute w-[200px] h-[200px] origin-center"
          style={{
            backgroundColor: color,
            transform: 'rotateX(60deg) rotateZ(45deg)',
            boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.2), 8px 8px 0 rgba(0,0,0,0.3)',
            border: '4px solid #000',
          }}
        />
        
        {/* Left Wall */}
        <div 
          className="absolute w-[200px] h-[150px] origin-bottom-left"
          style={{
            backgroundColor: color,
            filter: 'brightness(0.8)',
            transform: 'rotateX(60deg) rotateZ(45deg) rotateY(-90deg)',
            transformOrigin: 'bottom left',
            bottom: '50%',
            left: '50%',
            border: '4px solid #000',
          }}
        />

        {/* Right Wall */}
        <div 
          className="absolute w-[200px] h-[150px] origin-bottom-right"
          style={{
            backgroundColor: color,
            filter: 'brightness(0.9)',
            transform: 'rotateX(60deg) rotateZ(45deg) rotateX(-90deg)',
            transformOrigin: 'bottom right',
            bottom: '50%',
            right: '50%',
            border: '4px solid #000',
          }}
        />

        {/* Content Inside Room */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
             {children}
          </div>
        </div>

        {/* Title Label */}
        {title && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="font-pixel text-[12px] bg-black text-white px-3 py-1 pixel-border">
              {title}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
