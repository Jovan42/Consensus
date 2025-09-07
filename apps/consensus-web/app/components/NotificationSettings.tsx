'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  X,
  Check
} from 'lucide-react';
import { 
  isNotificationSoundEnabled, 
  setNotificationSoundEnabled, 
  playNotificationSound 
} from '../utils/notificationSound';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current settings
  useEffect(() => {
    setSoundEnabled(isNotificationSoundEnabled());
  }, []);

  const handleToggleSound = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const newValue = !soundEnabled;
      setNotificationSoundEnabled(newValue);
      setSoundEnabled(newValue);

      // Test the sound if enabling
      if (newValue) {
        await playNotificationSound();
      }

      setMessage({
        type: 'success',
        text: `Notification sounds ${newValue ? 'enabled' : 'disabled'}`
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update notification settings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSound = async () => {
    if (!soundEnabled) return;
    
    setIsLoading(true);
    try {
      await playNotificationSound();
      setMessage({
        type: 'success',
        text: 'Test sound played'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Could not play test sound'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Notification Settings</h2>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'success' ? 'success' : 'error'}>
              {message.text}
            </Alert>
          )}

          {/* Sound Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-medium text-foreground">Notification Sound</h3>
                  <p className="text-sm text-muted-foreground">
                    Play a sound when new notifications arrive
                  </p>
                </div>
              </div>
              
              <Button
                variant={soundEnabled ? "primary" : "outline"}
                size="sm"
                onClick={handleToggleSound}
                disabled={isLoading}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : soundEnabled ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    On
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-1" />
                    Off
                  </>
                )}
              </Button>
            </div>

            {/* Test Sound Button */}
            {soundEnabled && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSound}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  Test Sound
                </Button>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Sounds are played when new notifications arrive in real-time</p>
              <p>• Your preference is saved locally in your browser</p>
              <p>• Some browsers may require user interaction before playing sounds</p>
            </div>
          </div>

          {/* Close Button */}
          {onClose && (
            <div className="flex justify-end pt-4">
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
