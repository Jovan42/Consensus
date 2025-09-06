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
import { useClub, useClubMembers, useAddMember, useRemoveMember } from '../../../hooks/useApi';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Mail, 
  User,
  Users
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  const { club, isLoading: clubLoading } = useClub(clubId);
  const { members, isLoading: membersLoading, mutate } = useClubMembers(clubId);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

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
      await mutate(); // Refresh the members list
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
      await mutate(); // Refresh the members list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  if (clubLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!club) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h2>
          <p className="text-gray-600 mb-6">The club you're looking for doesn't exist.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Members</h1>
              <p className="text-gray-600">{club.name}</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Add Member Form */}
        {showAddForm && (
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
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {membersLoading ? '...' : members?.length || 0} members
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-1" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      loading={removingMember === member.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                <p className="text-gray-600 mb-4">
                  Add members to your club to start organizing activities
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
