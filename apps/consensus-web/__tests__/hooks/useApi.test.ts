import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { SWRConfig } from 'swr'
import { useGetClubs, useCreateClub, useSubmitVote } from '../../app/hooks/useApi'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Wrapper for SWR
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
)

describe('useApi hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useGetClubs', () => {
    it('fetches clubs successfully', async () => {
      const mockClubs = [
        { id: '1', name: 'Book Club', type: 'BOOK_CLUB' },
        { id: '2', name: 'Movie Club', type: 'MOVIE_NIGHT' }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockClubs })
      })

      const { result } = renderHook(() => useGetClubs(), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockClubs)
        expect(result.current.error).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('handles fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useGetClubs(), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeDefined()
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('handles API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, message: 'Internal server error' })
      })

      const { result } = renderHook(() => useGetClubs(), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeDefined()
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('useCreateClub', () => {
    it('creates club successfully', async () => {
      const newClub = {
        name: 'New Book Club',
        type: 'BOOK_CLUB',
        config: {
          minRecommendations: 3,
          maxRecommendations: 5,
          votingPoints: [3, 2, 1],
          turnOrder: 'SEQUENTIAL',
          tieBreakingMethod: 'RANDOM',
          minimumParticipation: 80,
        }
      }

      const createdClub = { id: 'new-id', ...newClub }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: createdClub })
      })

      const { result } = renderHook(() => useCreateClub(), { wrapper })

      const response = await result.current(newClub)

      expect(response).toEqual({ success: true, data: createdClub })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/clubs'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClub)
        })
      )
    })

    it('handles creation error', async () => {
      const newClub = { name: 'New Club', type: 'BOOK_CLUB' }
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCreateClub(), { wrapper })

      await expect(result.current(newClub)).rejects.toThrow('Network error')
    })
  })

  describe('useSubmitVote', () => {
    it('submits vote successfully', async () => {
      const voteData = {
        roundId: 'round-1',
        memberId: 'member-1',
        votes: [
          { recommendationId: 'rec-1', points: 3 },
          { recommendationId: 'rec-2', points: 2 }
        ]
      }

      const response = { success: true, message: 'Vote submitted' }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response
      })

      const { result } = renderHook(() => useSubmitVote(), { wrapper })

      const submitResponse = await result.current(
        voteData.roundId,
        voteData.memberId,
        voteData.votes
      )

      expect(submitResponse).toEqual(response)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/rounds/${voteData.roundId}/votes`),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: voteData.memberId,
            votes: voteData.votes
          })
        })
      )
    })

    it('handles vote submission error', async () => {
      const voteData = {
        roundId: 'round-1',
        memberId: 'member-1',
        votes: [{ recommendationId: 'rec-1', points: 3 }]
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, message: 'Invalid vote data' })
      })

      const { result } = renderHook(() => useSubmitVote(), { wrapper })

      await expect(result.current(
        voteData.roundId,
        voteData.memberId,
        voteData.votes
      )).rejects.toThrow('Invalid vote data')
    })

    it('handles network error', async () => {
      const voteData = {
        roundId: 'round-1',
        memberId: 'member-1',
        votes: [{ recommendationId: 'rec-1', points: 3 }]
      }
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useSubmitVote(), { wrapper })

      await expect(result.current(
        voteData.roundId,
        voteData.memberId,
        voteData.votes
      )).rejects.toThrow('Network error')
    })
  })
})
