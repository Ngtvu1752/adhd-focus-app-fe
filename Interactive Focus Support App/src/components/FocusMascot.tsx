import React from 'react';
import { motion } from 'motion/react';

interface FocusMascotProps {
  mood?: 'happy' | 'focused' | 'celebrating' | 'resting';
  size?: number;
}

export function FocusMascot({ mood = 'happy', size = 120 }: FocusMascotProps) {
  const getEyeState = () => {
    if (mood === 'focused') return 'M35,45 Q35,48 38,48 Q41,48 41,45';
    if (mood === 'resting') return 'M35,45 L41,45';
    return 'M35,42 Q35,48 38,48 Q41,48 41,42 Z';
  };

  const getMouthPath = () => {
    if (mood === 'celebrating') return 'M38,62 Q38,68 45,68 Q52,68 52,62';
    if (mood === 'focused') return 'M40,60 L50,60';
    if (mood === 'resting') return 'M38,60 Q45,63 52,60';
    return 'M38,58 Q45,63 52,58';
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        y: mood === 'celebrating' ? [0, -10, 0] : 0
      }}
      transition={{ 
        scale: { type: 'spring', stiffness: 260, damping: 20 },
        y: { repeat: mood === 'celebrating' ? Infinity : 0, duration: 0.6 }
      }}
    >
      {/* Body */}
      <motion.circle
        cx="50"
        cy="55"
        r="35"
        fill="#FFD966"
        animate={mood === 'celebrating' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      
      {/* Left Ear */}
      <motion.ellipse
        cx="25"
        cy="30"
        rx="8"
        ry="15"
        fill="#FFD966"
        animate={{ rotate: mood === 'celebrating' ? [0, -10, 0] : 0 }}
        style={{ originX: '25px', originY: '30px' }}
        transition={{ repeat: mood === 'celebrating' ? Infinity : 0, duration: 0.4 }}
      />
      
      {/* Right Ear */}
      <motion.ellipse
        cx="75"
        cy="30"
        rx="8"
        ry="15"
        fill="#FFD966"
        animate={{ rotate: mood === 'celebrating' ? [0, 10, 0] : 0 }}
        style={{ originX: '75px', originY: '30px' }}
        transition={{ repeat: mood === 'celebrating' ? Infinity : 0, duration: 0.4 }}
      />
      
      {/* Face */}
      <circle cx="50" cy="45" r="25" fill="#FFF4CC" />
      
      {/* Left Eye */}
      <motion.path
        d={getEyeState()}
        fill="#333333"
        animate={mood === 'resting' ? {
          scaleY: [1, 0.1, 1]
        } : {}}
        style={{ transformOrigin: '38px 45px' }}
        transition={{ repeat: mood === 'resting' ? Infinity : 0, duration: 2, repeatDelay: 1 }}
      />
      
      {/* Right Eye */}
      <motion.path
        d={mood === 'focused' ? 'M59,45 Q59,48 62,48 Q65,48 65,45' : 
           mood === 'resting' ? 'M59,45 L65,45' : 
           'M59,42 Q59,48 62,48 Q65,48 65,42 Z'}
        fill="#333333"
        animate={mood === 'resting' ? {
          scaleY: [1, 0.1, 1]
        } : {}}
        style={{ transformOrigin: '62px 45px' }}
        transition={{ repeat: mood === 'resting' ? Infinity : 0, duration: 2, repeatDelay: 1 }}
      />
      
      {/* Nose */}
      <circle cx="50" cy="53" r="2" fill="#FFB84D" />
      
      {/* Mouth */}
      <motion.path
        d={getMouthPath()}
        stroke="#333333"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Cheeks */}
      <motion.circle
        cx="30"
        cy="52"
        r="5"
        fill="#FFB6C1"
        opacity="0.6"
        animate={mood === 'celebrating' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      <motion.circle
        cx="70"
        cy="52"
        r="5"
        fill="#FFB6C1"
        opacity="0.6"
        animate={mood === 'celebrating' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      
      {/* Sparkles when celebrating */}
      {mood === 'celebrating' && (
        <>
          <motion.circle
            cx="20"
            cy="20"
            r="3"
            fill="#FFD966"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <motion.circle
            cx="80"
            cy="25"
            r="3"
            fill="#FFD966"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
          />
          <motion.circle
            cx="15"
            cy="60"
            r="3"
            fill="#FFD966"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}
          />
          <motion.circle
            cx="85"
            cy="65"
            r="3"
            fill="#FFD966"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.9 }}
          />
        </>
      )}
    </motion.svg>
  );
}
