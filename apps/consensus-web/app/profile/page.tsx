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
  Edit,
  Save,
  X,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isTestAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information and preferences
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
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
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-3xl">👤</span>
                      </div>
                    )}
                    {isTestAccount && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-warning-100 text-warning-800 p-1 rounded-full">
                          <TestTube className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </div>
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
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="flex items-center space-x-2 text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-error-100 text-error-800' 
                          : 'bg-info-100 text-info-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Member'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">User ID</label>
                    <div className="flex items-center space-x-2 text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{user.sub}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Account Type</label>
                    <div className="flex items-center space-x-2">
                      {isTestAccount ? (
                        <>
                          <TestTube className="h-4 w-4 text-warning-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            Test Account
                          </span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 text-success-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            OAuth Account
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // In a real app, this would open a change password modal
                    alert('Change password functionality would be implemented here');
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // In a real app, this would open notification preferences
                    alert('Notification preferences would be implemented here');
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        alert('Account deletion would be implemented here');
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Last updated:</span>
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
                        <p className="text-warning-700">
                          This is a development test account. Changes are stored locally.
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
    </Layout>
  );
}
