import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Volume2, VolumeX, Palette, Sparkles, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { FocusMascot } from './FocusMascot';
import { toast } from 'sonner';
import {AVATAR_OPTIONS, THEME_COLORS} from '../constrants/kidProfileData';

export function KidProfileSettings() {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEME_COLORS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  // Load profile from localStorage on mount
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('kidProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setName(profile.name || '');
      setSelectedAvatar(AVATAR_OPTIONS.find(a => a.id === profile.avatarId) || AVATAR_OPTIONS[0]);
      setSelectedTheme(THEME_COLORS.find(t => t.id === profile.themeId) || THEME_COLORS[0]);
      setSoundEnabled(profile.soundEnabled ?? true);
    }
  }, []);

  const handleSave = () => {
    const profile = {
      name,
      avatarId: selectedAvatar.id,
      themeId: selectedTheme.id,
      soundEnabled,
    };
    localStorage.setItem('kidProfile', JSON.stringify(profile));
    window.dispatchEvent(new Event('kidProfileUpdated'));
    setShowSaveAnimation(true);
    toast.success('Profile saved! 🎉');
    
    setTimeout(() => {
      setShowSaveAnimation(false);
    }, 2000);
  };

  const stats = {
    totalStars: 42,
    level: 5,
    tasksCompleted: 28,
    streak: 7,
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ background: `linear-gradient(135deg, ${selectedTheme.primary} 0%, #F7F4EE 100%)` }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" style={{ color: selectedTheme.secondary }} />
            <h1 style={{ color: '#333333' }}>My Profile</h1>
            <Sparkles className="w-8 h-8" style={{ color: selectedTheme.secondary }} />
          </div>
          <p style={{ color: '#666666' }}>Make it yours! Customize your FocusBuddy experience</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Profile Customization */}
          <div className="space-y-6">
            {/* Name Section */}
            <motion.div
              className="rounded-3xl p-6 shadow-lg"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6" style={{ color: '#FFD966', fill: '#FFD966' }} />
                <h3 style={{ color: '#333333' }}>Your Name</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" style={{ color: '#666666' }}>
                  What should we call you?
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg rounded-2xl"
                  style={{ borderColor: selectedTheme.secondary }}
                />
              </div>
            </motion.div>

            {/* Avatar Selection */}
            <motion.div
              className="rounded-3xl p-6 shadow-lg"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6" style={{ color: '#FFD966' }} />
                <h3 style={{ color: '#333333' }}>Choose Your Avatar</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    className="relative aspect-square rounded-2xl flex items-center justify-center text-4xl cursor-pointer border-4 transition-all"
                    style={{
                      backgroundColor: selectedAvatar.id === avatar.id ? avatar.color + '20' : '#F7F4EE',
                      borderColor: selectedAvatar.id === avatar.id ? avatar.color : 'transparent',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {avatar.emoji}
                    {selectedAvatar.id === avatar.id && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        <CheckCircle2 
                          className="w-6 h-6" 
                          style={{ color: avatar.color, fill: avatar.color }}
                        />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Theme Selection */}
            <motion.div
              className="rounded-3xl p-6 shadow-lg"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-6 h-6" style={{ color: '#FFD966' }} />
                <h3 style={{ color: '#333333' }}>Pick Your Theme</h3>
              </div>
              <div className="space-y-3">
                {THEME_COLORS.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className="w-full p-4 rounded-2xl flex items-center gap-3 border-2 transition-all"
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: selectedTheme.id === theme.id ? theme.secondary : 'transparent',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <span style={{ color: '#333333' }}>{theme.name}</span>
                    {selectedTheme.id === theme.id && (
                      <CheckCircle2 
                        className="w-5 h-5 ml-auto" 
                        style={{ color: theme.secondary, fill: theme.secondary }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Sound Settings */}
            <motion.div
              className="rounded-3xl p-6 shadow-lg"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-6 h-6" style={{ color: '#FFD966' }} />
                  ) : (
                    <VolumeX className="w-6 h-6" style={{ color: '#999' }} />
                  )}
                  <div>
                    <h3 style={{ color: '#333333' }}>Sound Effects</h3>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {soundEnabled ? 'Sounds are on' : 'Sounds are off'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview & Stats */}
          <div className="space-y-6">
            {/* Profile Preview */}
            <motion.div
              className="rounded-3xl p-8 shadow-lg text-center"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="mb-6" style={{ color: '#333333' }}>Profile Preview</h3>
              
              <motion.div
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg"
                style={{ backgroundColor: selectedAvatar.color + '20' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {selectedAvatar.emoji}
              </motion.div>

              <motion.h2
                className="mb-2"
                style={{ color: '#333333' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {name || 'Your Name'}
              </motion.h2>

              <div className="mb-6">
                <FocusMascot mood="happy" size={120} />
              </div>

              <div
                className="inline-block px-6 py-3 rounded-full"
                style={{ backgroundColor: selectedTheme.primary }}
              >
                <p style={{ color: selectedTheme.secondary }}>
                  Your FocusBuddy is ready! 🎉
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="rounded-3xl p-6 shadow-lg"
              style={{ backgroundColor: 'white' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-4" style={{ color: '#333333' }}>Your Achievements</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="p-4 rounded-2xl text-center"
                  style={{ backgroundColor: '#E8F5FF' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl mb-1" style={{ color: '#333333' }}>
                    {stats.totalStars}
                  </div>
                  <div className="text-sm" style={{ color: '#666666' }}>Total Stars</div>
                </motion.div>

                <motion.div
                  className="p-4 rounded-2xl text-center"
                  style={{ backgroundColor: '#DFF7E8' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-2xl mb-1" style={{ color: '#333333' }}>
                    Level {stats.level}
                  </div>
                  <div className="text-sm" style={{ color: '#666666' }}>Current Level</div>
                </motion.div>

                <motion.div
                  className="p-4 rounded-2xl text-center"
                  style={{ backgroundColor: '#FFF9E6' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl mb-1" style={{ color: '#333333' }}>
                    {stats.tasksCompleted}
                  </div>
                  <div className="text-sm" style={{ color: '#666666' }}>Tasks Done</div>
                </motion.div>

                <motion.div
                  className="p-4 rounded-2xl text-center"
                  style={{ backgroundColor: '#FCE4EC' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl mb-1" style={{ color: '#333333' }}>
                    {stats.streak}
                  </div>
                  <div className="text-sm" style={{ color: '#666666' }}>Day Streak</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleSave}
                size="lg"
                className="w-full h-16 rounded-2xl text-lg"
                style={{
                  backgroundColor: '#FFD966',
                  color: '#333333',
                }}
              >
                <Save className="w-6 h-6 mr-2" />
                Save My Profile
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Save Success Animation */}
        {showSaveAnimation && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-8xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
