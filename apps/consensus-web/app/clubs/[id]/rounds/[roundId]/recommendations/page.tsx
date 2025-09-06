'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '../../../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Textarea } from '../../../../../components/ui/Textarea';
import { Alert } from '../../../../../components/ui/Alert';
import { useRound, useAddRecommendations } from '../../../../../hooks/useApi';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  User
} from 'lucide-react';
import Link from 'next/link';

const recommendationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

const addRecommendationsSchema = z.object({
  recommendations: z.array(recommendationSchema).min(1, 'At least one recommendation is required'),
});

type AddRecommendationsForm = z.infer<typeof addRecommendationsSchema>;

export default function AddRecommendations() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const roundId = params.roundId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { round, isLoading: roundLoading } = useRound(roundId);
  const addRecommendations = useAddRecommendations();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddRecommendationsForm>({
    resolver: zodResolver(addRecommendationsSchema),
    defaultValues: {
      recommendations: [{ title: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recommendations',
  });

  const onSubmit = async (data: AddRecommendationsForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await addRecommendations(roundId, data.recommendations);
      router.push(`/clubs/${clubId}/rounds/${roundId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recommendations');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (roundLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!round) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Round Not Found</h2>
          <p className="text-gray-600 mb-6">The round you're looking for doesn't exist.</p>
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

  if (round.status !== 'recommending') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Round Not in Recommending Phase</h2>
          <p className="text-gray-600 mb-6">
            This round is currently in the {round.status} phase and cannot accept new recommendations.
          </p>
          <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Round
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
        <div className="flex items-center space-x-4">
          <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Round
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Recommendations</h1>
            <p className="text-gray-600">
              Add your recommendations for this round
            </p>
          </div>
        </div>

        {/* Round Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">
                  Current recommender: {round.currentRecommender?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  Add your recommendations below. You can add multiple items.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recommendations</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recommendation {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Input
                    label="Title"
                    placeholder="Enter recommendation title"
                    error={errors.recommendations?.[index]?.title?.message}
                    {...register(`recommendations.${index}.title`)}
                  />

                  <Textarea
                    label="Description (Optional)"
                    placeholder="Enter a description or additional details"
                    rows={3}
                    error={errors.recommendations?.[index]?.description?.message}
                    {...register(`recommendations.${index}.description`)}
                  />
                </div>
              ))}

              {errors.recommendations && (
                <Alert variant="error">
                  {errors.recommendations.message}
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" loading={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Recommendations
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
