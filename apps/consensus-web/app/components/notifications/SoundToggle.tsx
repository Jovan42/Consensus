'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { 
  isNotificationSoundEnabled, 
  setNotificationSoundEnabled, 
  playNotificationSound 
} from '../../utils/notificationSound';
import { useCurrentUserSettings } from '../../hooks/useCurrentUserSettings';
import { useToast } from '../../hooks/useToast';

interface SoundToggleProps {
  className?: string;
  showText?: boolean;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ 
  className = '', 
  showText = false 
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { settings, updateSettings } = useCurrentUserSettings();
  const { toast } = useToast();

  // Load current settings from user settings
  useEffect(() => {
    if (settings?.enableNotificationSound !== undefined) {
      setSoundEnabled(settings.enableNotificationSound);
      setNotificationSoundEnabled(settings.enableNotificationSound);
    } else {
      // Fallback to local storage if settings not loaded yet
      setSoundEnabled(isNotificationSoundEnabled());
    }
  }, [settings?.enableNotificationSound]);

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      const newValue = !soundEnabled;
      
      // Update local state immediately
      setNotificationSoundEnabled(newValue);
      setSoundEnabled(newValue);

      // Save to database
      await updateSettings({ 
        enableNotificationSound: newValue,
        notificationSound: newValue ? 'default' : 'none'
      });

      // Test the sound if enabling
      if (newValue) {
        console.log('🔊 Testing notification sound...');
        await playNotificationSound();
      }

      toast({
        type: 'success',
        title: 'Notification Sound Updated',
        message: `Notification sound ${newValue ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.warn('Could not toggle notification sound:', error);
      toast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save notification sound preference'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${className}`}
      title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : soundEnabled ? (
        <Volume2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <VolumeX className="h-4 w-4 text-gray-400" />
      )}
      {showText && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </span>
      )}
    </button>
  );
};
