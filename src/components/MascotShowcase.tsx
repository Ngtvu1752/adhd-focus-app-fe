import React from 'react';
import { motion } from 'motion/react';
import { FocusMascot } from './FocusMascot';

type MoodType = 'happy' | 'focused' | 'celebrating' | 'resting' | 'frustrated' | 'bored' | 'stressed' | 'surprised';

interface MoodInfo {
  mood: MoodType;
  label: string;
  description: string;
  color: string;
  emoji: string;
}

const moods: MoodInfo[] = [
  {
    mood: 'happy',
    label: 'Happy',
    description: 'Positive engagement, ready to learn!',
    color: '#FFD966',
    emoji: '😊'
  },
  {
    mood: 'focused',
    label: 'Focused',
    description: 'Concentrated and working hard',
    color: '#4A90E2',
    emoji: '🎯'
  },
  {
    mood: 'celebrating',
    label: 'Celebrating',
    description: 'Great job! Achievement unlocked!',
    color: '#5CB85C',
    emoji: '🎉'
  },
  {
    mood: 'resting',
    label: 'Resting',
    description: 'Taking a well-deserved break',
    color: '#DFF7E8',
    emoji: '😴'
  },
  {
    mood: 'frustrated',
    label: 'Frustrated',
    description: 'Feeling annoyed or upset',
    color: '#FF6B6B',
    emoji: '😤'
  },
  {
    mood: 'bored',
    label: 'Bored',
    description: 'Not engaged, needs stimulation',
    color: '#999999',
    emoji: '😑'
  },
  {
    mood: 'stressed',
    label: 'Stressed',
    description: 'Feeling worried or anxious',
    color: '#B8E0FF',
    emoji: '😰'
  },
  {
    mood: 'surprised',
    label: 'Surprised',
    description: 'Startled or distracted',
    color: '#FF9933',
    emoji: '😮'
  }
];

export function MascotShowcase() {
  return (
    <div 
      className="min-h-screen p-6"
      style={{ background: 'linear-gradient(135deg, #E8F5FF 0%, #F7F4EE 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-4" style={{ color: '#333333' }}>
            FocusBuddy Emotions
          </h1>
          <p className="text-xl" style={{ color: '#666666' }}>
            Meet all the different emotions your FocusBuddy can express!
          </p>
        </motion.div>

        {/* Moods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {moods.map((moodInfo, index) => (
            <motion.div
              key={moodInfo.mood}
              className="rounded-3xl p-6 shadow-lg text-center"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              {/* Mood Badge */}
              <div className="flex justify-center mb-4">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: moodInfo.color + '30' }}
                >
                  <span className="text-xl">{moodInfo.emoji}</span>
                  <span style={{ color: '#333333' }}>{moodInfo.label}</span>
                </div>
              </div>

              {/* Mascot */}
              <div className="flex justify-center mb-4">
                <FocusMascot mood={moodInfo.mood} size={150} />
              </div>

              {/* Description */}
              <p className="text-sm" style={{ color: '#666666' }}>
                {moodInfo.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Priority Legend */}
        <motion.div
          className="mt-12 rounded-3xl p-8 shadow-lg"
          style={{ backgroundColor: 'white' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="mb-6 text-center" style={{ color: '#333333' }}>
            Emotion Categories
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Priority 1 */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#E8F5FF' }}>
              <h3 className="mb-4" style={{ color: '#333333' }}>
                🎯 Essential Emotions (Must-Have)
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span style={{ color: '#666666' }}>
                    <strong>Focused:</strong> Deep concentration mode
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">😤</span>
                  <span style={{ color: '#666666' }}>
                    <strong>Frustrated:</strong> Recognizing stress signals
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">😑</span>
                  <span style={{ color: '#666666' }}>
                    <strong>Bored:</strong> Disengagement indicator
                  </span>
                </li>
              </ul>
            </div>

            {/* Priority 2 */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#DFF7E8' }}>
              <h3 className="mb-4" style={{ color: '#333333' }}>
                ✨ Enhanced Emotions (Good to Have)
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">😊</span>
                  <span style={{ color: '#666666' }}>
                    <strong>Happy:</strong> Positive reinforcement
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">😰</span>
                  <span style={{ color: '#666666' }}>
                    <strong>Stressed:</strong> Anxiety awareness
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">😮</span>
                  <span style={{ color: '#666666' }}>
                    <strong>Surprised:</strong> Distraction detection
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Usage Guide */}
        <motion.div
          className="mt-8 rounded-3xl p-8 shadow-lg"
          style={{ backgroundColor: '#FFF9E6' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="mb-4 text-center" style={{ color: '#333333' }}>
            💡 How to Use These Emotions
          </h2>
          <p className="text-center mb-6" style={{ color: '#666666' }}>
            These emotional expressions help children with ADHD:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🧠</div>
              <p style={{ color: '#333333' }}>Recognize their own feelings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p style={{ color: '#333333' }}>Stay engaged with tasks</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💪</div>
              <p style={{ color: '#333333' }}>Build emotional awareness</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
