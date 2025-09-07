'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { useCreateClub } from '../../hooks/useApi';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const createClubSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(100, 'Club name must be less than 100 characters'),
  type: z.enum(['book', 'movie', 'restaurant', 'travel', 'gaming', 'learning', 'event', 'podcast', 'tv', 'music', 'other']),
  minRecommendations: z.number().min(1, 'Minimum must be at least 1').max(10, 'Maximum must be at most 10'),
  maxRecommendations: z.number().min(1, 'Minimum must be at least 1').max(10, 'Maximum must be at most 10'),
  votingPoints: z.string(),
  turnOrder: z.enum(['sequential', 'random']),
  tieBreakingMethod: z.enum(['random', 'recommender_decides', 're_vote']),
  minimumParticipation: z.number().min(50, 'Minimum participation must be at least 50%').max(100, 'Maximum participation must be at most 100%'),
}).refine((data) => data.minRecommendations <= data.maxRecommendations, {
  message: 'Minimum recommendations must be less than or equal to maximum recommendations',
  path: ['maxRecommendations'],
});

type CreateClubForm = z.infer<typeof createClubSchema>;

const clubTypeOptions = [
  { value: 'book', label: 'Book Club' },
  { value: 'movie', label: 'Movie Night' },
  { value: 'restaurant', label: 'Restaurant Group' },
  { value: 'travel', label: 'Travel Planning' },
  { value: 'gaming', label: 'Gaming Group' },
  { value: 'learning', label: 'Learning Group' },
  { value: 'event', label: 'Event Planning' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'tv', label: 'TV Show' },
  { value: 'music', label: 'Music' },
  { value: 'other', label: 'Other' },
];

const turnOrderOptions = [
  { value: 'sequential', label: 'Sequential (A→B→C→A)' },
  { value: 'random', label: 'Random' },
];

const tieBreakingOptions = [
  { value: 'random', label: 'Random selection' },
  { value: 'recommender_decides', label: 'Recommender decides' },
  { value: 're_vote', label: 'Re-vote on tied items' },
];

const votingPointsOptions = [
  { value: '[3,2,1]', label: '3 points, 2 points, 1 point (for 3 items)' },
  { value: '[5,4,3,2,1]', label: '5 points, 4 points, 3 points, 2 points, 1 point (for 5+ items)' },
  { value: '[2,1]', label: '2 points, 1 point (for 2 items)' },
  { value: '[4,3,2,1]', label: '4 points, 3 points, 2 points, 1 point (for 4 items)' },
];

export default function CreateClub() {
  const router = useRouter();
  const createClub = useCreateClub();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateClubForm>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      minRecommendations: 2,
      maxRecommendations: 4,
      votingPoints: '[3,2,1]',
      turnOrder: 'sequential',
      tieBreakingMethod: 'recommender_decides',
      minimumParticipation: 80,
    },
  });

  const watchedMinRecommendations = watch('minRecommendations');

  const onSubmit = async (data: CreateClubForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const clubData = {
        name: data.name,
        type: data.type,
        config: {
          minRecommendations: data.minRecommendations,
          maxRecommendations: data.maxRecommendations,
          votingPoints: JSON.parse(data.votingPoints),
          turnOrder: data.turnOrder,
          tieBreakingMethod: data.tieBreakingMethod,
          minimumParticipation: data.minimumParticipation,
        },
      };

      const newClub = await createClub(clubData);
      router.push(`/clubs/${newClub.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Club</h1>
            <p className="mt-2 text-muted-foreground">
              Set up a new club for your group activities
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Club Details</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
                
                <Input
                  label="Club Name"
                  placeholder="Enter club name"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Select
                  label="Club Type"
                  options={clubTypeOptions}
                  error={errors.type?.message}
                  {...register('type')}
                />
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Configuration</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Recommendations"
                    type="number"
                    min="1"
                    max="10"
                    error={errors.minRecommendations?.message}
                    {...register('minRecommendations', { valueAsNumber: true })}
                  />

                  <Input
                    label="Maximum Recommendations"
                    type="number"
                    min={watchedMinRecommendations || 1}
                    max="10"
                    error={errors.maxRecommendations?.message}
                    {...register('maxRecommendations', { valueAsNumber: true })}
                  />
                </div>

                <Select
                  label="Voting Points System"
                  options={votingPointsOptions}
                  error={errors.votingPoints?.message}
                  {...register('votingPoints')}
                />

                <Select
                  label="Turn Order"
                  options={turnOrderOptions}
                  error={errors.turnOrder?.message}
                  {...register('turnOrder')}
                />

                <Select
                  label="Tie-Breaking Method"
                  options={tieBreakingOptions}
                  error={errors.tieBreakingMethod?.message}
                  {...register('tieBreakingMethod')}
                />

                <Input
                  label="Minimum Participation (%)"
                  type="number"
                  min="50"
                  max="100"
                  error={errors.minimumParticipation?.message}
                  {...register('minimumParticipation', { valueAsNumber: true })}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" loading={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Club
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
