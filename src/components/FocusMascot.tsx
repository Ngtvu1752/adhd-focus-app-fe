import React from 'react';
import { motion } from 'motion/react';

interface FocusMascotProps {
  mood?: 'happy' | 'focused' | 'celebrating' | 'resting' | 'frustrated' | 'bored' | 'stressed' | 'surprised';
  size?: number;
}

export function FocusMascot({ mood = 'happy', size = 120 }: FocusMascotProps) {
  const getEyeState = () => {
    // Frustrated - Angry squinted eyes
    if (mood === 'frustrated') return 'M35,48 L38,45 L41,48';
    // Bored - Half-closed droopy eyes
    if (mood === 'bored') return 'M35,48 L41,48';
    // Stressed - Wide worried eyes
    if (mood === 'stressed') return 'M34,44 Q34,50 38,50 Q42,50 42,44 Z';
    // Surprised - Very wide open eyes
    if (mood === 'surprised') return 'M33,44 Q33,52 38,52 Q43,52 43,44 Z';
    // Focused - Concentrated
    if (mood === 'focused') return 'M35,47 Q35,50 38,50 Q41,50 41,47';
    // Resting - Closed eyes
    if (mood === 'resting') return 'M35,47 L41,47';
    // Happy - Normal round eyes
    return 'M35,44 Q35,50 38,50 Q41,50 41,44 Z';
  };

  const getRightEyeState = () => {
    // Frustrated - Angry squinted eyes
    if (mood === 'frustrated') return 'M59,48 L62,45 L65,48';
    // Bored - Half-closed droopy eyes
    if (mood === 'bored') return 'M59,48 L65,48';
    // Stressed - Wide worried eyes
    if (mood === 'stressed') return 'M58,44 Q58,50 62,50 Q66,50 66,44 Z';
    // Surprised - Very wide open eyes
    if (mood === 'surprised') return 'M57,44 Q57,52 62,52 Q67,52 67,44 Z';
    // Focused - Concentrated
    if (mood === 'focused') return 'M59,47 Q59,50 62,50 Q65,50 65,47';
    // Resting - Closed eyes
    if (mood === 'resting') return 'M59,47 L65,47';
    // Happy - Normal round eyes
    return 'M59,44 Q59,50 62,50 Q65,50 65,44 Z';
  };

  const getMouthPath = () => {
    // Celebrating - Big open smile
    if (mood === 'celebrating') return 'M38,64 Q38,70 45,70 Q52,70 52,64';
    // Frustrated - Angry frown
    if (mood === 'frustrated') return 'M38,65 Q45,61 52,65';
    // Bored - Flat uninterested
    if (mood === 'bored') return 'M38,63 L52,63';
    // Stressed - Wavy nervous mouth
    if (mood === 'stressed') return 'M38,63 Q42,65 45,63 Q48,61 52,63';
    // Surprised - Open O shape
    if (mood === 'surprised') return 'M41,62 Q41,67 45,67 Q49,67 49,62 Q49,60 45,60 Q41,60 41,62 Z';
    // Focused - Neutral determined
    if (mood === 'focused') return 'M40,62 L50,62';
    // Resting - Gentle smile
    if (mood === 'resting') return 'M38,62 Q45,65 52,62';
    // Happy - Normal smile
    return 'M38,60 Q45,65 52,60';
  };

  const getEyebrowLeft = () => {
    // Frustrated - Angled down inward (angry)
    if (mood === 'frustrated') return 'M32,40 L42,42';
    // Bored - Slightly drooped
    if (mood === 'bored') return 'M32,41 Q37,42 42,41';
    // Stressed - Raised worried
    if (mood === 'stressed') return 'M32,38 Q37,36 42,38';
    // Surprised - Very raised
    if (mood === 'surprised') return 'M32,37 Q37,34 42,37';
    return null;
  };

  const getEyebrowRight = () => {
    // Frustrated - Angled down inward (angry)
    if (mood === 'frustrated') return 'M58,42 L68,40';
    // Bored - Slightly drooped
    if (mood === 'bored') return 'M58,41 Q63,42 68,41';
    // Stressed - Raised worried
    if (mood === 'stressed') return 'M58,38 Q63,36 68,38';
    // Surprised - Very raised
    if (mood === 'surprised') return 'M58,37 Q63,34 68,37';
    return null;
  };

  const getBodyAnimation = () => {
    if (mood === 'celebrating') return { scale: [1, 1.05, 1] };
    if (mood === 'frustrated') return { x: [-2, 2, -2], rotate: [-1, 1, -1] };
    if (mood === 'stressed') return { y: [-1, 1, -1] };
    if (mood === 'surprised') return { scale: [1, 1.03, 1] };
    return {};
  };

  const getEarAnimation = (side: 'left' | 'right') => {
    const baseRotation = side === 'left' ? -10 : 10;
    if (mood === 'celebrating') return { rotate: [0, baseRotation, 0] };
    if (mood === 'frustrated') return { rotate: side === 'left' ? [-5, -15, -5] : [5, 15, 5] };
    if (mood === 'stressed') return { rotate: [0, baseRotation * 0.5, 0] };
    if (mood === 'surprised') return { rotate: side === 'left' ? [0, -20, 0] : [0, 20, 0] };
    return { rotate: 0 };
  };

  const getCheekColor = () => {
    if (mood === 'frustrated') return '#FF6B6B';
    if (mood === 'stressed') return '#B8E0FF';
    if (mood === 'bored') return '#D3D3D3';
    return '#FFB6C1';
  };

  const getCheekOpacity = () => {
    if (mood === 'frustrated') return 0.7;
    if (mood === 'stressed') return 0.5;
    if (mood === 'bored') return 0.3;
    return 0.6;
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
      {/* Shadow */}
      <ellipse
        cx="50"
        cy="92"
        rx="25"
        ry="4"
        fill="#333333"
        opacity="0.15"
      />

      {/* Body with gradient */}
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE599" />
          <stop offset="100%" stopColor="#FFD966" />
        </linearGradient>
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFEF0" />
          <stop offset="100%" stopColor="#FFF8DC" />
        </linearGradient>
        <radialGradient id="shine">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="faceShadow" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#FFD966" stopOpacity="0" />
          <stop offset="70%" stopColor="#FFD966" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFD966" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Body */}
      <motion.circle
        cx="50"
        cy="55"
        r="35"
        fill="url(#bodyGradient)"
        animate={getBodyAnimation()}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />

      {/* Body shine effect */}
      <ellipse
        cx="45"
        cy="45"
        rx="15"
        ry="20"
        fill="url(#shine)"
        opacity="0.5"
      />
      
      {/* Left Ear - BIGGER & LOWER */}
      <motion.g
        animate={getEarAnimation('left')}
        style={{ transformOrigin: '28px 38px' }}
        transition={{ repeat: mood === 'celebrating' || mood === 'stressed' || mood === 'surprised' || mood === 'frustrated' ? Infinity : 0, duration: 0.4 }}
      >
        {/* Ear shadow for depth */}
        <ellipse
          cx="28"
          cy="40"
          rx="11"
          ry="19"
          fill="#FFB84D"
          opacity="0.3"
        />
        <ellipse
          cx="28"
          cy="38"
          rx="11"
          ry="19"
          fill="url(#bodyGradient)"
        />
        <ellipse
          cx="28"
          cy="38"
          rx="6"
          ry="12"
          fill="#FFE599"
          opacity="0.6"
        />
      </motion.g>
      
      {/* Right Ear - BIGGER & LOWER */}
      <motion.g
        animate={getEarAnimation('right')}
        style={{ transformOrigin: '72px 38px' }}
        transition={{ repeat: mood === 'celebrating' || mood === 'stressed' || mood === 'surprised' || mood === 'frustrated' ? Infinity : 0, duration: 0.4 }}
      >
        {/* Ear shadow for depth */}
        <ellipse
          cx="72"
          cy="40"
          rx="11"
          ry="19"
          fill="#FFB84D"
          opacity="0.3"
        />
        <ellipse
          cx="72"
          cy="38"
          rx="11"
          ry="19"
          fill="url(#bodyGradient)"
        />
        <ellipse
          cx="72"
          cy="38"
          rx="6"
          ry="12"
          fill="#FFE599"
          opacity="0.6"
        />
      </motion.g>
      
      {/* Chin/Neck connection shadow - Creates depth between face and body */}
      <ellipse
        cx="50"
        cy="65"
        rx="20"
        ry="8"
        fill="#FFB84D"
        opacity="0.2"
      />
      
      {/* Face with shadow overlay for depth */}
      <circle cx="50" cy="48" r="25" fill="url(#faceGradient)" />
      
      {/* Face shadow from head - Creates volume */}
      <ellipse
        cx="50"
        cy="48"
        rx="25"
        ry="25"
        fill="url(#faceShadow)"
      />

      {/* Face shine */}
      <ellipse
        cx="42"
        cy="40"
        rx="8"
        ry="10"
        fill="white"
        opacity="0.3"
      />
      
      {/* Eyebrows */}
      {getEyebrowLeft() && (
        <motion.path
          d={getEyebrowLeft()!}
          stroke="#8B7355"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={mood === 'frustrated' ? { y: [0, -1, 0] } : {}}
          transition={{ repeat: mood === 'frustrated' ? Infinity : 0, duration: 0.5 }}
        />
      )}
      {getEyebrowRight() && (
        <motion.path
          d={getEyebrowRight()!}
          stroke="#8B7355"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={mood === 'frustrated' ? { y: [0, -1, 0] } : {}}
          transition={{ repeat: mood === 'frustrated' ? Infinity : 0, duration: 0.5 }}
        />
      )}

      {/* Left Eye white */}
      <motion.ellipse
        cx="38"
        cy="46"
        rx={mood === 'surprised' || mood === 'stressed' ? "6" : "5"}
        ry={mood === 'surprised' || mood === 'stressed' ? "7" : "6"}
        fill="white"
        animate={mood === 'resting' || mood === 'bored' ? { scaleY: [1, 0.1, 1] } : 
                 mood === 'stressed' ? { scaleX: [1, 0.95, 1] } : {}}
        style={{ transformOrigin: '38px 46px' }}
        transition={{ repeat: (mood === 'resting' || mood === 'bored') ? Infinity : (mood === 'stressed' ? Infinity : 0), duration: mood === 'stressed' ? 0.3 : 2, repeatDelay: mood === 'stressed' ? 0 : 1 }}
      />

      {/* Right Eye white */}
      <motion.ellipse
        cx="62"
        cy="46"
        rx={mood === 'surprised' || mood === 'stressed' ? "6" : "5"}
        ry={mood === 'surprised' || mood === 'stressed' ? "7" : "6"}
        fill="white"
        animate={mood === 'resting' || mood === 'bored' ? { scaleY: [1, 0.1, 1] } : 
                 mood === 'stressed' ? { scaleX: [1, 0.95, 1] } : {}}
        style={{ transformOrigin: '62px 46px' }}
        transition={{ repeat: (mood === 'resting' || mood === 'bored') ? Infinity : (mood === 'stressed' ? Infinity : 0), duration: mood === 'stressed' ? 0.3 : 2, repeatDelay: mood === 'stressed' ? 0 : 1 }}
      />

      {/* Left Eye */}
      <motion.path
        d={getEyeState()}
        fill="#333333"
        animate={mood === 'resting' || mood === 'bored' ? {
          scaleY: [1, 0.1, 1]
        } : mood === 'stressed' ? { scaleX: [1, 0.95, 1] } : {}}
        style={{ transformOrigin: '38px 47px' }}
        transition={{ repeat: (mood === 'resting' || mood === 'bored') ? Infinity : (mood === 'stressed' ? Infinity : 0), duration: mood === 'stressed' ? 0.3 : 2, repeatDelay: mood === 'stressed' ? 0 : 1 }}
      />

      {/* Left Eye shine - Don't show for frustrated */}
      {mood !== 'frustrated' && (
        <circle cx="36" cy="45" r="2" fill="white" opacity="0.8" />
      )}
      
      {/* Right Eye */}
      <motion.path
        d={getRightEyeState()}
        fill="#333333"
        animate={mood === 'resting' || mood === 'bored' ? {
          scaleY: [1, 0.1, 1]
        } : mood === 'stressed' ? { scaleX: [1, 0.95, 1] } : {}}
        style={{ transformOrigin: '62px 47px' }}
        transition={{ repeat: (mood === 'resting' || mood === 'bored') ? Infinity : (mood === 'stressed' ? Infinity : 0), duration: mood === 'stressed' ? 0.3 : 2, repeatDelay: mood === 'stressed' ? 0 : 1 }}
      />

      {/* Right Eye shine - Don't show for frustrated */}
      {mood !== 'frustrated' && (
        <circle cx="60" cy="45" r="2" fill="white" opacity="0.8" />
      )}
      
      {/* Nose */}
      <ellipse cx="50" cy="55" rx="2.5" ry="3" fill="#FFB84D" />
      <ellipse cx="49" cy="54" rx="1" ry="1.5" fill="#FF9933" />
      
      {/* Mouth */}
      <motion.path
        d={getMouthPath()}
        stroke="#333333"
        strokeWidth="2.5"
        fill={mood === 'surprised' ? '#FFA07A' : 'none'}
        strokeLinecap="round"
      />

      {/* Tongue when celebrating */}
      {mood === 'celebrating' && (
        <motion.ellipse
          cx="45"
          cy="67"
          rx="4"
          ry="3"
          fill="#FF6B9D"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}
      
      {/* Cheeks */}
      <motion.g>
        <motion.ellipse
          cx="30"
          cy="54"
          rx="6"
          ry="5"
          fill={getCheekColor()}
          opacity={getCheekOpacity()}
          animate={mood === 'celebrating' ? { scale: [1, 1.3, 1], opacity: [0.6, 0.8, 0.6] } : 
                   mood === 'frustrated' ? { opacity: [0.7, 0.9, 0.7] } : {}}
          transition={{ repeat: mood === 'celebrating' || mood === 'frustrated' ? Infinity : 0, duration: 0.8 }}
        />
        <ellipse
          cx="28"
          cy="53"
          rx="2"
          ry="1.5"
          fill={mood === 'frustrated' ? '#FF4444' : '#FF9BAE'}
          opacity="0.4"
        />
      </motion.g>

      <motion.g>
        <motion.ellipse
          cx="70"
          cy="54"
          rx="6"
          ry="5"
          fill={getCheekColor()}
          opacity={getCheekOpacity()}
          animate={mood === 'celebrating' ? { scale: [1, 1.3, 1], opacity: [0.6, 0.8, 0.6] } : 
                   mood === 'frustrated' ? { opacity: [0.7, 0.9, 0.7] } : {}}
          transition={{ repeat: mood === 'celebrating' || mood === 'frustrated' ? Infinity : 0, duration: 0.8 }}
        />
        <ellipse
          cx="72"
          cy="53"
          rx="2"
          ry="1.5"
          fill={mood === 'frustrated' ? '#FF4444' : '#FF9BAE'}
          opacity="0.4"
        />
      </motion.g>

      {/* Cute heart on body when focused */}
      {mood === 'focused' && (
        <motion.path
          d="M50,70 L48,67 Q46,65 46,63 Q46,61 47,60 Q48,59 49,59 Q50,59 50,60 Q50,59 51,59 Q52,59 53,60 Q54,61 54,63 Q54,65 52,67 Z"
          fill="#FF6B9D"
          opacity="0.7"
          animate={{ scale: [1, 1.1, 1] }}
          style={{ transformOrigin: '50px 65px' }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Star accessory when resting */}
      {mood === 'resting' && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <path
            d="M45,25 L46,28 L49,28 L47,30 L48,33 L45,31 L42,33 L43,30 L41,28 L44,28 Z"
            fill="#FFD966"
            stroke="#FFB84D"
            strokeWidth="0.5"
          />
        </motion.g>
      )}

      {/* Sweat drop when stressed */}
      {mood === 'stressed' && (
        <motion.g
          animate={{ y: [0, 5, 0], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <path
            d="M68,48 Q70,50 70,53 Q70,55 68,55 Q66,55 66,53 Q66,50 68,48 Z"
            fill="#B8E0FF"
            opacity="0.8"
          />
          <ellipse cx="67.5" cy="50" rx="0.8" ry="1.2" fill="white" opacity="0.6" />
        </motion.g>
      )}

      {/* Exclamation mark when surprised */}
      {mood === 'surprised' && (
        <motion.g
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <circle cx="72" cy="30" r="8" fill="#FFD966" opacity="0.3" />
          <rect x="70" y="24" width="4" height="8" rx="2" fill="#FF6B35" />
          <circle cx="72" cy="35" r="2" fill="#FF6B35" />
        </motion.g>
      )}

      {/* Frustration lines */}
      {mood === 'frustrated' && (
        <motion.g
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        >
          <path d="M68,25 L72,20" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
          <path d="M75,28 L80,26" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      )}

      {/* Zzz when bored */}
      {mood === 'bored' && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, -5, -10, -15] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
        >
          <text x="68" y="30" fill="#999999" fontSize="8">Z</text>
          <motion.text 
            x="72" 
            y="25" 
            fill="#999999" 
            fontSize="10"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: 0.3, repeat: Infinity, duration: 3, repeatDelay: 1 }}
          >
            Z
          </motion.text>
          <motion.text 
            x="77" 
            y="20" 
            fill="#999999" 
            fontSize="12"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: 0.6, repeat: Infinity, duration: 3, repeatDelay: 1 }}
          >
            Z
          </motion.text>
        </motion.g>
      )}
      
      {/* Sparkles when celebrating */}
      {mood === 'celebrating' && (
        <>
          <motion.g>
            <motion.path
              d="M20,20 L21,23 L24,24 L21,25 L20,28 L19,25 L16,24 L19,23 Z"
              fill="#FFD966"
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 180, 360] }}
              style={{ transformOrigin: '20px 24px' }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </motion.g>
          
          <motion.g>
            <motion.path
              d="M80,25 L81,28 L84,29 L81,30 L80,33 L79,30 L76,29 L79,28 Z"
              fill="#DFF7E8"
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, -180, -360] }}
              style={{ transformOrigin: '80px 29px' }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
            />
          </motion.g>

          <motion.g>
            <motion.circle
              cx="15"
              cy="60"
              r="3"
              fill="#E8F5FF"
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}
            />
          </motion.g>

          <motion.g>
            <motion.circle
              cx="85"
              cy="65"
              r="3"
              fill="#FFB6C1"
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.9 }}
            />
          </motion.g>
        </>
      )}
    </motion.svg>
  );
}