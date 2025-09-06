import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppProvider } from '../../context/AppContext'

// Mock data for testing
export const mockClub = {
  id: 'test-club-id',
  name: 'Test Book Club',
  type: 'BOOK_CLUB' as const,
  config: {
    minRecommendations: 3,
    maxRecommendations: 5,
    votingPoints: [3, 2, 1],
    turnOrder: 'SEQUENTIAL' as const,
    tieBreakingMethod: 'RANDOM' as const,
    minimumParticipation: 80,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockMember = {
  id: 'test-member-id',
  name: 'John Doe',
  email: 'john@example.com',
  clubId: 'test-club-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockRound = {
  id: 'test-round-id',
  clubId: 'test-club-id',
  recommenderId: 'test-member-id',
  status: 'RECOMMENDATIONS' as const,
  winningRecommendationId: null,
  previousRoundId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockRecommendation = {
  id: 'test-recommendation-id',
  roundId: 'test-round-id',
  recommenderId: 'test-member-id',
  title: 'Test Book',
  description: 'A great test book',
  type: 'BOOK' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockVote = {
  id: 'test-vote-id',
  roundId: 'test-round-id',
  memberId: 'test-member-id',
  recommendationId: 'test-recommendation-id',
  points: 3,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockCompletion = {
  id: 'test-completion-id',
  recommendationId: 'test-recommendation-id',
  memberId: 'test-member-id',
  isCompleted: false,
  completedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AppProvider>{children}</AppProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
