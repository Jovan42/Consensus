'use client';

import React, { useState } from 'react';
import { useUsers, deleteUser, User } from '../hooks/useUsers';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { Trash2, Settings, User as UserIcon, Mail, Calendar, Globe, Shield } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useError } from '../contexts/ErrorContext';
import UserSettingsModal from './UserSettingsModal';
import DeleteUserModal from './DeleteUserModal';

export default function UserManagement() {
  const { users, isLoading, error, mutate } = useUsers();
  const { toast } = useToast();
  const { handleHttpError } = useError();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser(user.id);
      toast({
        type: 'success',
        title: 'User Deleted',
        message: `User ${user.email} has been deleted successfully.`
      });
      mutate(); // Refresh the users list
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      handleHttpError(error, 'User Management');
    }
  };

  const openSettingsModal = (user: User) => {
    setSelectedUser(user);
    setShowSettingsModal(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load users</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and their settings
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} users
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {user.name}
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge className={getStatusColor(user.isActive)}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {user.lastLoginAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {user.timezone && (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{user.timezone}</span>
                    </div>
                  )}
                  {user.emailVerified && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>Email verified</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSettingsModal(user)}
                    className="flex-1"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteModal(user)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-muted-foreground">
            There are no users in the system yet.
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserSettingsModal
          user={selectedUser}
          isOpen={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            mutate(); // Refresh users list
            setShowSettingsModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={() => handleDeleteUser(userToDelete)}
        />
      )}
    </div>
  );
}
