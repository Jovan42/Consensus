'use client';

import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar,
  Shield,
  Crown,
  Edit,
  Save,
  X,
  TestTube,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { NotificationSettings } from '../components/NotificationSettings';
import { useCurrentUserSettings } from '../hooks/useCurrentUserSettings';
import { useToast } from '../hooks/useToast';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function ProfilePage() {
  const { user, isTestAccount } = useAuth();
  const { settings, updateSettings, isLoading: settingsLoading } = useCurrentUserSettings();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call - in a real app, you'd update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local storage for test accounts
      if (isTestAccount && user) {
        const updatedUser = { ...user, name: editedName.trim() };
        localStorage.setItem('testUser', JSON.stringify(updatedUser));
        // Trigger a page refresh to update the auth context
        window.location.reload();
      }
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSettingUpdate = async (key: string, value: any) => {
    try {
      await updateSettings({ [key]: value });
      toast({
        type: 'success',
        title: 'Setting Updated',
        message: 'Your preference has been saved'
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save your preference'
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Not Authenticated</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-2 hidden sm:block">
              Manage your account information and preferences
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="sm:size-default">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information and User Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">Profile Information</h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Information */}
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="border border-border rounded-md px-3 py-2 text-lg font-medium"
                          placeholder="Enter your name"
                        />
                      ) : (
                        user.name
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {isTestAccount && (
                      <div className="mt-2">
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          <TestTube className="h-3 w-3" />
                          <span className="hidden sm:inline">Test Account</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground hidden sm:block">Email</label>
                    <div className="flex items-center space-x-2 text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm sm:text-base truncate">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground hidden sm:block">Role</label>
                    <div className="flex items-center space-x-2">
                      {user.role === 'admin' ? (
                        <Crown className="h-4 w-4 text-error" />
                      ) : (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-error/10 text-error' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground hidden sm:block">User ID</label>
                    <div className="flex items-center space-x-2 text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs sm:text-sm truncate">{user.sub}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground hidden sm:block">Account Type</label>
                    <div className="flex items-center space-x-2">
                      {isTestAccount ? (
                        <>
                          <TestTube className="h-4 w-4 text-warning-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            Test
                          </span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 text-success-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            OAuth
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                  <div className="flex items-center space-x-2 sm:space-x-3 pt-4 border-t border-border">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="sm"
                      className="sm:size-default"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white sm:mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 sm:mr-2" />
                      )}
                      <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      size="sm"
                      className="sm:size-default"
                    >
                      <X className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Settings */}
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">User Settings</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : settings ? (
                  <>
                    {/* Theme Setting */}
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={settings.theme}
                        onValueChange={(value) => handleSettingUpdate('theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-3">
                      <Label>Notifications</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enableNotifications" className="text-sm">Enable Notifications</Label>
                          <Switch
                            id="enableNotifications"
                            checked={settings.enableNotifications}
                            onCheckedChange={(checked) => handleSettingUpdate('enableNotifications', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enableNotificationSound" className="text-sm">Notification Sound</Label>
                          <Switch
                            id="enableNotificationSound"
                            checked={settings.enableNotificationSound}
                            onCheckedChange={(checked) => handleSettingUpdate('enableNotificationSound', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailNotifications" className="text-sm">Email Notifications</Label>
                          <Switch
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => handleSettingUpdate('emailNotifications', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-3">
                      <Label>Privacy</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showOnlineStatus" className="text-sm">Show Online Status</Label>
                          <Switch
                            id="showOnlineStatus"
                            checked={settings.showOnlineStatus}
                            onCheckedChange={(checked) => handleSettingUpdate('showOnlineStatus', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showProfilePicture" className="text-sm">Show Profile Picture</Label>
                          <Switch
                            id="showProfilePicture"
                            checked={settings.showProfilePicture}
                            onCheckedChange={(checked) => handleSettingUpdate('showProfilePicture', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showEmailInProfile" className="text-sm">Show Email in Profile</Label>
                          <Switch
                            id="showEmailInProfile"
                            checked={settings.showEmailInProfile}
                            onCheckedChange={(checked) => handleSettingUpdate('showEmailInProfile', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div className="space-y-3">
                      <Label>Display</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showVoteProgress" className="text-sm">Show Vote Progress</Label>
                          <Switch
                            id="showVoteProgress"
                            checked={settings.showVoteProgress}
                            onCheckedChange={(checked) => handleSettingUpdate('showVoteProgress', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showCompletionProgress" className="text-sm">Show Completion Progress</Label>
                          <Switch
                            id="showCompletionProgress"
                            checked={settings.showCompletionProgress}
                            onCheckedChange={(checked) => handleSettingUpdate('showCompletionProgress', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground text-sm">Failed to load settings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Account Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => {
                    // In a real app, this would open a change password modal
                    alert('Change password functionality would be implemented here');
                  }}
                  title="Change Password"
                >
                  <Shield className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Change Password</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setShowNotificationSettings(true)}
                  title="Notification Settings"
                >
                  <Bell className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Notification Settings</span>
                </Button>

                <div className="pt-3 sm:pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        alert('Account deletion would be implemented here');
                      }
                    }}
                    title="Delete Account"
                  >
                    <X className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete Account</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Account Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground hidden sm:inline">Last updated:</span>
                  <span className="text-muted-foreground sm:hidden">Updated:</span>
                  <span className="ml-2 text-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                
                {isTestAccount && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <TestTube className="h-4 w-4 text-warning-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-warning-800 font-medium">Test Account</p>
                        <p className="text-warning-700 hidden sm:block">
                          This is a development test account. Changes are stored locally.
                        </p>
                        <p className="text-warning-700 sm:hidden">
                          Development test account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </Layout>
  );
}
