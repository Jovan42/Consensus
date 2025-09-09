'use client';

import React, { useState, useEffect } from 'react';
import { User, UserSettings, useUserSettings, updateUserSettings } from '../hooks/useUsers';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/Dialog';
import { Separator } from './ui/Separator';
import { useToast } from '../hooks/useToast';
import { useError } from '../contexts/ErrorContext';

interface UserSettingsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function UserSettingsModal({ user, isOpen, onClose, onSave }: UserSettingsModalProps) {
  const { settings, isLoading, mutate } = useUserSettings(user.id);
  const { toast } = useToast();
  const { handleHttpError } = useError();
  const [formData, setFormData] = useState<Partial<UserSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await updateUserSettings(user.id, formData);
      toast({
        type: 'success',
        title: 'Settings Updated',
        message: `Settings for ${user.email} have been updated successfully.`
      });
      mutate(); // Refresh settings
      onSave();
    } catch (error) {
      handleHttpError(error, 'User Settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof UserSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Loading User Settings</DialogTitle>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Manage settings for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={formData.theme || 'system'} onValueChange={(value) => updateField('theme', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language || 'en'} onValueChange={(value) => updateField('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow notifications to be sent to this user
                  </p>
                </div>
                <Switch
                  checked={formData.enableNotifications || false}
                  onCheckedChange={(checked) => updateField('enableNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when notifications arrive
                  </p>
                </div>
                <Switch
                  checked={formData.enableNotificationSound || false}
                  onCheckedChange={(checked) => updateField('enableNotificationSound', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationSound">Sound Type</Label>
                <Select value={formData.notificationSound || 'default'} onValueChange={(value) => updateField('notificationSound', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationDuration">Notification Duration (ms)</Label>
                <Input
                  id="notificationDuration"
                  type="number"
                  value={formData.notificationDuration || 5000}
                  onChange={(e) => updateField('notificationDuration', parseInt(e.target.value))}
                  min="1000"
                  max="10000"
                  step="500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications || false}
                  onCheckedChange={(checked) => updateField('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications || false}
                  onCheckedChange={(checked) => updateField('pushNotifications', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy & Display</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Display when this user is online
                  </p>
                </div>
                <Switch
                  checked={formData.showOnlineStatus || false}
                  onCheckedChange={(checked) => updateField('showOnlineStatus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Profile Picture</Label>
                  <p className="text-sm text-muted-foreground">
                    Display profile picture in the app
                  </p>
                </div>
                <Switch
                  checked={formData.showProfilePicture || false}
                  onCheckedChange={(checked) => updateField('showProfilePicture', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email in Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Display email address in profile
                  </p>
                </div>
                <Switch
                  checked={formData.showEmailInProfile || false}
                  onCheckedChange={(checked) => updateField('showEmailInProfile', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* App Behavior Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">App Behavior</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Join Clubs</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically join new clubs
                  </p>
                </div>
                <Switch
                  checked={formData.autoJoinClubs || false}
                  onCheckedChange={(checked) => updateField('autoJoinClubs', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Vote Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Display voting progress indicators
                  </p>
                </div>
                <Switch
                  checked={formData.showVoteProgress || false}
                  onCheckedChange={(checked) => updateField('showVoteProgress', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Completion Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Display completion progress indicators
                  </p>
                </div>
                <Switch
                  checked={formData.showCompletionProgress || false}
                  onCheckedChange={(checked) => updateField('showCompletionProgress', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemsPerPage">Items Per Page</Label>
                <Input
                  id="itemsPerPage"
                  type="number"
                  value={formData.itemsPerPage || 12}
                  onChange={(e) => updateField('itemsPerPage', parseInt(e.target.value))}
                  min="5"
                  max="50"
                  step="1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
