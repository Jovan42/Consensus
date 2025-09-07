/**
 * Utility functions for playing notification sounds
 */

// Create a simple notification sound using Web Audio API
const createNotificationSound = (): AudioBuffer => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.5; // 500ms (increased from 300ms)
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);

  // Create a pleasant notification tone (two-tone chime)
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    
    // First tone: 800Hz
    const tone1 = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 2);
    
    // Second tone: 1000Hz (starts after 0.1s)
    const tone2 = t > 0.1 ? Math.sin(2 * Math.PI * 1000 * (t - 0.1)) * Math.exp(-(t - 0.1) * 2) : 0;
    
    // Third tone: 1200Hz (starts after 0.2s)
    const tone3 = t > 0.2 ? Math.sin(2 * Math.PI * 1200 * (t - 0.2)) * Math.exp(-(t - 0.2) * 2) : 0;
    
    // Combine tones with envelope
    const envelope = Math.exp(-t * 1.5);
    data[i] = (tone1 + tone2 + tone3) * envelope * 0.6; // 60% volume (increased from 30%)
  }

  return buffer;
};

// Cache for the audio buffer
let notificationBuffer: AudioBuffer | null = null;

// Debounce mechanism to prevent rapid-fire sounds
let lastSoundTime = 0;
const SOUND_DEBOUNCE_MS = 1000; // Minimum 1 second between sounds

/**
 * Play a notification sound
 */
export const playNotificationSound = async (): Promise<void> => {
  try {
    // Check if audio is allowed (user interaction required)
    if (typeof window === 'undefined') return;

    // Debounce: prevent rapid-fire sounds
    const now = Date.now();
    if (now - lastSoundTime < SOUND_DEBOUNCE_MS) {
      console.log('🔇 Sound debounced (too soon after last sound)');
      return;
    }
    lastSoundTime = now;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context if it's suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Create or reuse the notification buffer
    if (!notificationBuffer) {
      notificationBuffer = createNotificationSound();
    }

    // Create and play the sound
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = notificationBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume (80% of the buffer's volume - increased from 50%)
    gainNode.gain.value = 0.8;
    
    // Play the sound
    source.start();
    
    console.log('🔔 Notification sound played');
  } catch (error) {
    console.warn('Could not play notification sound:', error);
    // Fallback: try to play a simple beep using HTML5 Audio
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      audio.volume = 0.6; // Increased from 0.3
      await audio.play();
    } catch (fallbackError) {
      console.warn('Fallback notification sound also failed:', fallbackError);
    }
  }
};

/**
 * Check if notification sounds are enabled (based on user preferences)
 */
export const isNotificationSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check localStorage for user preference
  const soundEnabled = localStorage.getItem('notification-sound-enabled');
  
  // Default to true if no preference is set
  return soundEnabled !== 'false';
};

/**
 * Set notification sound preference
 */
export const setNotificationSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('notification-sound-enabled', enabled.toString());
};

/**
 * Play notification sound if enabled
 */
export const playNotificationSoundIfEnabled = async (): Promise<void> => {
  const enabled = isNotificationSoundEnabled();
  console.log('🔊 Sound enabled:', enabled);
  if (enabled) {
    await playNotificationSound();
  } else {
    console.log('🔇 Sound disabled, not playing');
  }
};
