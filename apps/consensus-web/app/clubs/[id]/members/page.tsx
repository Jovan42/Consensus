'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { useClub, useClubMembers, useAddMember, useRemoveMember, useUpdateMemberManagerStatus } from '../../../hooks/useApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useRealtimeUpdates } from '../../../hooks/useRealtimeUpdates';
import { useNotificationHandler } from '../../../hooks/useNotificationHandler';
import { Member } from '../../../context/AppContext';
import { getTestAccount } from '../../../../lib/auth0';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Mail, 
  User,
  Users,
  Shield,
  Crown
} from 'lucide-react';
import Link from 'next/link';

const addMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
});

type AddMemberForm = z.infer<typeof addMemberSchema>;

export default function ClubMembers() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const { user, hasRole } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [updatingManager, setUpdatingManager] = useState<string | null>(null);
  
  // Enable real-time updates for this page
  useRealtimeUpdates({ clubId });

  const { club, isLoading: clubLoading } = useClub(clubId);
  const { members, isLoading: membersLoading, mutate } = useClubMembers(clubId);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const updateMemberManagerStatus = useUpdateMemberManagerStatus();

  // Register component-specific notification handlers
  useNotificationHandler({
    component: 'MembersPage',
    notificationTypes: ['member_added', 'member_removed', 'member_role_changed'],
    handler: (event) => {
      console.log('Members page received notification:', event);
      
      // Only handle events for this specific club
      if (event.data.clubId === clubId) {
        switch (event.type) {
          case 'member_added':
            console.log('Member added to club, refreshing members list');
            mutate(); // Refresh members list
            break;
          case 'member_removed':
            console.log('Member removed from club, refreshing members list');
            mutate(); // Refresh members list
            break;
          case 'member_role_changed':
            console.log('Member role changed, refreshing members list');
            mutate(); // Refresh members list
            break;
        }
      }
    },
    priority: 10 // High priority for member-related events
  });

  // Permission checks
  const currentUserMember = members?.find((m: Member) => m.email === user?.email);
  const canManageMembers = hasRole('admin') || currentUserMember?.isClubManager;
  const isMember = !!currentUserMember || hasRole('admin');

  // Helper function to check if a member is a site admin
  const isSiteAdmin = (memberEmail: string): boolean => {
    const testAccount = getTestAccount(memberEmail);
    return testAccount?.role === 'admin';
  };

  // Helper function to get member role priority for sorting
  const getMemberRolePriority = (member: Member): number => {
    if (isSiteAdmin(member.email)) return 1; // Site Admin - highest priority
    if (member.isClubManager) return 2; // Club Manager - medium priority
    return 3; // Regular Member - lowest priority
  };

  // Sort members by role importance
  const sortedMembers = members ? [...members].sort((a, b) => {
    const priorityA = getMemberRolePriority(a);
    const priorityB = getMemberRolePriority(b);
    
    // If same priority, sort alphabetically by name
    if (priorityA === priorityB) {
      return a.name.localeCompare(b.name);
    }
    
    return priorityA - priorityB;
  }) : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
  });

  const onSubmit = async (data: AddMemberForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await addMember(clubId, data);
      // No need to manually mutate - targeted updates will handle the refresh
      reset();
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMember(memberId);
    setError(null);

    try {
      await removeMember(clubId, memberId);
      // No need to manually mutate - targeted updates will handle the refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  const handleUpdateManagerStatus = async (memberId: string, isClubManager: boolean) => {
    setUpdatingManager(memberId);
    setError(null);

    try {
      await updateMemberManagerStatus(memberId, isClubManager);
      // No need to manually mutate - targeted updates will handle the refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update manager status');
    } finally {
      setUpdatingManager(null);
    }
  };

  if (clubLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!club) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Club Not Found</h2>
          <p className="text-muted-foreground mb-6">The club you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Check if user is a member of the club
  if (!isMember) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You must be a member of this club to view its members.</p>
          <Link href={`/clubs/${clubId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Club
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
          <div className="flex items-center space-x-4">
            <Link href={`/clubs/${clubId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Club
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Members</h1>
              <p className="text-muted-foreground">{club.name}</p>
              {!canManageMembers && (
                <p className="text-sm text-muted-foreground mt-1">
                  View-only mode - you can see members but cannot make changes
                </p>
              )}
            </div>
          </div>
          {canManageMembers && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Add Member Form */}
        {showAddForm && canManageMembers && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Add New Member</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="Enter member name"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Club Members</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {membersLoading ? '...' : members?.length || 0} members
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : sortedMembers && sortedMembers.length > 0 ? (
              <div className="space-y-3">
                {sortedMembers.map((member: Member) => {
                  const isCurrentUser = member.email === user?.email;
                  const memberIsSiteAdmin = isSiteAdmin(member.email);
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          memberIsSiteAdmin ? 'bg-error/10' : 
                          member.isClubManager ? 'bg-warning/10' : 'bg-primary/10'
                        }`}>
                          {memberIsSiteAdmin ? (
                            <Crown className="h-5 w-5 text-error" />
                          ) : member.isClubManager ? (
                            <Users className="h-5 w-5 text-warning" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-foreground">{member.name}</p>
                            <div className="flex items-center space-x-1">
                              {memberIsSiteAdmin && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Site Admin
                                </span>
                              )}
                              {member.isClubManager && !memberIsSiteAdmin && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                                  <Users className="h-3 w-3 mr-1" />
                                  Manager
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {canManageMembers && !isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateManagerStatus(member.id, !member.isClubManager)}
                            loading={updatingManager === member.id}
                            className={member.isClubManager 
                              ? "text-warning hover:text-warning hover:bg-warning/10" 
                              : "text-warning hover:text-warning hover:bg-warning/10"
                            }
                          >
                            {member.isClubManager ? (
                              <>
                                <Shield className="h-4 w-4 mr-1" />
                                Demote
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4 mr-1" />
                                Promote
                              </>
                            )}
                          </Button>
                        )}
                        
                        {canManageMembers && !isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            loading={removingMember === member.id}
                            className="text-error hover:text-error hover:bg-error/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add members to your club to start organizing activities
                </p>
                {canManageMembers && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
