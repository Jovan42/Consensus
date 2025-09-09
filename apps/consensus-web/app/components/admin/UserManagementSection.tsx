'use client';

import React, { useState, useMemo } from 'react';
import { useUsers, deleteUser, User } from '../../hooks/useUsers';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Trash2, Settings, User as UserIcon, Mail, Calendar, Globe, Shield, Users, Search, Filter } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useError } from '../../contexts/ErrorContext';
import UserSettingsModal from '../UserSettingsModal';
import DeleteUserModal from '../DeleteUserModal';

export default function UserManagementSection() {
  const { users, isLoading, error, mutate } = useUsers();
  const { toast } = useToast();
  const { handleHttpError } = useError();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && user.isActive) ||
                           (statusFilter === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>User Management</span>
        </CardTitle>
        <CardDescription>
          Manage users and their settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                {filteredUsers.length} of {users.length} users
              </Badge>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* User Header */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge className={getStatusColor(user.isActive)}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {user.lastLoginAt && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {user.timezone && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>{user.timezone}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSettingsModal(user)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users available'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>

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
            mutate();
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
          onConfirm={() => userToDelete && handleDeleteUser(userToDelete)}
        />
      )}
    </Card>
  );
}
