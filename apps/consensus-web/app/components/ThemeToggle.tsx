'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useCurrentUserSettings } from '@/app/hooks/useCurrentUserSettings';
import { useToast } from '@/app/hooks/useToast';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './ui/Button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings, updateSettings } = useCurrentUserSettings();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme from user settings when settings change
  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings?.theme, setTheme]);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-8 bg-muted rounded" />
        ))}
      </div>
    );
  }

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      // Update local theme immediately
      setTheme(newTheme);
      
      // Save to database
      await updateSettings({ theme: newTheme });
      
      toast({
        type: 'success',
        title: 'Theme Updated',
        message: `Theme changed to ${newTheme}`
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save theme preference'
      });
    }
  };

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      {themes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={theme === value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleThemeChange(value)}
          className="h-8 w-8 p-0"
          title={`Switch to ${label} theme`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}

export function SimpleThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { settings, updateSettings } = useCurrentUserSettings();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme from user settings when settings change
  useEffect(() => {
    if (settings?.theme && settings.theme !== 'system') {
      setTheme(settings.theme);
    }
  }, [settings?.theme, setTheme]);

  const toggleTheme = async () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    try {
      // Update local theme immediately
      setTheme(newTheme);
      
      // Save to database
      await updateSettings({ theme: newTheme });
      
      toast({
        type: 'success',
        title: 'Theme Updated',
        message: `Theme changed to ${newTheme}`
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save theme preference'
      });
    }
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 bg-muted rounded" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0"
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
