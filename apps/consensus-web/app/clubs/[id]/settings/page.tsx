'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { useClub, useUpdateClub } from '../../../hooks/useApi';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function ClubSettings() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const { user, hasRole } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { club, isLoading: clubLoading, error: clubError, mutate: mutateClub } = useClub(clubId);
  const updateClub = useUpdateClub();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'book' as 'book' | 'movie' | 'music' | 'game' | 'other'
  });

  // Initialize form data when club loads
  React.useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || '',
        description: club.description || '',
        type: club.type || 'book'
      });
    }
  }, [club]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateClub.mutateAsync({
        id: clubId,
        name: formData.name,
        description: formData.description,
        type: formData.type
      });

      setSuccess('Club settings updated successfully!');
      mutateClub(); // Refresh the club data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update club settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!club) return;

    setIsDeleting(true);
    setError(null);

    try {
      // TODO: Implement delete club functionality
      setError('Delete functionality not yet implemented');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete club');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check if user has permission to edit settings
  const canEdit = hasRole('admin') || (club && user?.email === club.createdBy);

  if (clubLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (clubError || !club) {
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

  if (!canEdit) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to edit this club's settings.</p>
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
      <div className="max-w-2xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Club Settings</h1>
              <p className="text-gray-600">{club.name}</p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Club Settings Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            <p className="text-gray-600">Update your club's basic information</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Club Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Club Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter club name"
                />
              </div>

              {/* Club Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Club Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="book">Book Club</option>
                  <option value="movie">Movie Club</option>
                  <option value="music">Music Club</option>
                  <option value="game">Game Club</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your club's purpose and interests"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
            <p className="text-gray-600">Irreversible and destructive actions</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="text-lg font-medium text-red-800">Delete Club</h3>
                  <p className="text-red-600 text-sm">
                    Permanently delete this club and all its data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Club
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Club</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{club.name}"? This will permanently remove the club 
                and all its data including rounds, recommendations, and votes. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Club'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
