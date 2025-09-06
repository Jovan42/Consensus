import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import VotingPage from '../../app/clubs/[id]/rounds/[roundId]/voting/page'
import { mockRound, mockRecommendation, mockMember, mockVote } from '../utils/test-utils'

// Mock the API hooks
const mockSubmitVote = jest.fn()
const mockGetRound = jest.fn()
const mockGetRecommendations = jest.fn()
const mockGetMembers = jest.fn()
const mockGetVotes = jest.fn()

jest.mock('../../app/hooks/useApi', () => ({
  useSubmitVote: () => mockSubmitVote,
  useGetRound: () => mockGetRound,
  useGetRecommendations: () => mockGetRecommendations,
  useGetMembers: () => mockGetMembers,
  useGetVotes: () => mockGetVotes,
}))

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: 'test-club-id',
    roundId: 'test-round-id',
  }),
}))

describe('VotingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default mock returns
    mockGetRound.mockReturnValue({
      data: mockRound,
      error: null,
      isLoading: false,
    })
    
    mockGetRecommendations.mockReturnValue({
      data: [mockRecommendation],
      error: null,
      isLoading: false,
    })
    
    mockGetMembers.mockReturnValue({
      data: [mockMember],
      error: null,
      isLoading: false,
    })
    
    mockGetVotes.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    })
  })

  it('renders the voting page with recommendations', () => {
    render(<VotingPage />)
    
    expect(screen.getByText('Voting')).toBeInTheDocument()
    expect(screen.getByText('Test Book')).toBeInTheDocument()
  })

  it('displays member list', () => {
    render(<VotingPage />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows voting form when member is selected', async () => {
    const user = userEvent.setup()
    render(<VotingPage />)
    
    const memberButton = screen.getByText('John Doe')
    await user.click(memberButton)
    
    expect(screen.getByText('Vote for Recommendations')).toBeInTheDocument()
    expect(screen.getByLabelText(/points for test book/i)).toBeInTheDocument()
  })

  it('validates duplicate points', async () => {
    const user = userEvent.setup()
    render(<VotingPage />)
    
    const memberButton = screen.getByText('John Doe')
    await user.click(memberButton)
    
    const pointsInput = screen.getByLabelText(/points for test book/i)
    await user.type(pointsInput, '3')
    
    // Add another recommendation for testing
    mockGetRecommendations.mockReturnValue({
      data: [
        mockRecommendation,
        { ...mockRecommendation, id: 'rec-2', title: 'Test Book 2' }
      ],
      error: null,
      isLoading: false,
    })
    
    // Re-render to get the second recommendation
    render(<VotingPage />)
    
    const memberButton2 = screen.getByText('John Doe')
    await user.click(memberButton2)
    
    const pointsInput2 = screen.getByLabelText(/points for test book 2/i)
    await user.type(pointsInput2, '3') // Same points as first
    
    const submitButton = screen.getByRole('button', { name: /submit vote/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/each recommendation must have different points/i)).toBeInTheDocument()
    })
  })

  it('submits vote successfully', async () => {
    const user = userEvent.setup()
    mockSubmitVote.mockResolvedValue({ success: true })
    
    render(<VotingPage />)
    
    const memberButton = screen.getByText('John Doe')
    await user.click(memberButton)
    
    const pointsInput = screen.getByLabelText(/points for test book/i)
    await user.type(pointsInput, '3')
    
    const submitButton = screen.getByRole('button', { name: /submit vote/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmitVote).toHaveBeenCalledWith('test-round-id', 'test-member-id', [
        { recommendationId: 'test-recommendation-id', points: 3 }
      ])
    })
  })

  it('handles vote submission error', async () => {
    const user = userEvent.setup()
    mockSubmitVote.mockRejectedValue(new Error('Failed to submit vote'))
    
    render(<VotingPage />)
    
    const memberButton = screen.getByText('John Doe')
    await user.click(memberButton)
    
    const pointsInput = screen.getByLabelText(/points for test book/i)
    await user.type(pointsInput, '3')
    
    const submitButton = screen.getByRole('button', { name: /submit vote/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to submit vote/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during vote submission', async () => {
    const user = userEvent.setup()
    mockSubmitVote.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<VotingPage />)
    
    const memberButton = screen.getByText('John Doe')
    await user.click(memberButton)
    
    const pointsInput = screen.getByLabelText(/points for test book/i)
    await user.type(pointsInput, '3')
    
    const submitButton = screen.getByRole('button', { name: /submit vote/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/submitting vote/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('displays rankings when votes exist', () => {
    mockGetVotes.mockReturnValue({
      data: [mockVote],
      error: null,
      isLoading: false,
    })
    
    render(<VotingPage />)
    
    expect(screen.getByText('Current Rankings')).toBeInTheDocument()
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('3 points')).toBeInTheDocument()
  })

  it('shows member voting status', () => {
    mockGetVotes.mockReturnValue({
      data: [mockVote],
      error: null,
      isLoading: false,
    })
    
    render(<VotingPage />)
    
    // Member who has voted should show as voted
    const memberCard = screen.getByText('John Doe').closest('div')
    expect(memberCard).toHaveClass('bg-green-50') // Voted styling
  })

  it('disables voting for members who already voted', async () => {
    const user = userEvent.setup()
    mockGetVotes.mockReturnValue({
      data: [mockVote],
      error: null,
      isLoading: false,
    })
    
    render(<VotingPage />)
    
    const memberButton = screen.getByText('John Doe')
    await user.click(memberButton)
    
    // Should show "Back to Members" instead of voting form
    expect(screen.getByText('Back to Members')).toBeInTheDocument()
    expect(screen.queryByText('Vote for Recommendations')).not.toBeInTheDocument()
  })

  it('navigates back to round details', async () => {
    const user = userEvent.setup()
    render(<VotingPage />)
    
    const backButton = screen.getByRole('button', { name: /back to round/i })
    await user.click(backButton)
    
    expect(mockPush).toHaveBeenCalledWith('/clubs/test-club-id/rounds/test-round-id')
  })
})
