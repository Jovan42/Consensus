import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../context/AppContext'

// Mock the API
const mockCreateClub = jest.fn()
const mockGetClubs = jest.fn()

jest.mock('../../app/hooks/useApi', () => ({
  useCreateClub: () => mockCreateClub,
  useGetClubs: () => mockGetClubs,
}))

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Import components
import Dashboard from '../../app/page'
import CreateClubForm from '../../app/clubs/create/page'

describe('Club Creation Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock returns
    mockGetClubs.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    })
  })

  it('completes full club creation workflow', async () => {
    const user = userEvent.setup()
    
    // Mock successful club creation
    const newClub = {
      id: 'new-club-id',
      name: 'My New Book Club',
      type: 'BOOK_CLUB',
      config: {
        minRecommendations: 3,
        maxRecommendations: 5,
        votingPoints: [3, 2, 1],
        turnOrder: 'SEQUENTIAL',
        tieBreakingMethod: 'RANDOM',
        minimumParticipation: 80,
      },
    }
    
    mockCreateClub.mockResolvedValue({ success: true, data: newClub })

    // Start at dashboard
    render(
      <AppProvider>
        <Dashboard />
      </AppProvider>
    )

    // Should show empty state
    expect(screen.getByText('No clubs found')).toBeInTheDocument()

    // Click create club button
    const createButton = screen.getByRole('button', { name: /create club/i })
    await user.click(createButton)

    // Should navigate to create form
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/clubs/create')
    })

    // Now render the create form
    render(
      <AppProvider>
        <CreateClubForm />
      </AppProvider>
    )

    // Fill out the form
    await user.type(screen.getByLabelText(/club name/i), 'My New Book Club')
    await user.selectOptions(screen.getByLabelText(/club type/i), 'BOOK_CLUB')
    await user.type(screen.getByLabelText(/min recommendations/i), '3')
    await user.type(screen.getByLabelText(/max recommendations/i), '5')
    await user.type(screen.getByLabelText(/voting points/i), '[3,2,1]')
    await user.selectOptions(screen.getByLabelText(/turn order/i), 'SEQUENTIAL')
    await user.selectOptions(screen.getByLabelText(/tie breaking method/i), 'RANDOM')
    await user.type(screen.getByLabelText(/minimum participation/i), '80')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)

    // Should call the API with correct data
    await waitFor(() => {
      expect(mockCreateClub).toHaveBeenCalledWith({
        name: 'My New Book Club',
        type: 'BOOK_CLUB',
        config: {
          minRecommendations: 3,
          maxRecommendations: 5,
          votingPoints: [3, 2, 1],
          turnOrder: 'SEQUENTIAL',
          tieBreakingMethod: 'RANDOM',
          minimumParticipation: 80,
        },
      })
    })

    // Should navigate back to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles form validation errors', async () => {
    const user = userEvent.setup()

    render(
      <AppProvider>
        <CreateClubForm />
      </AppProvider>
    )

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/club name is required/i)).toBeInTheDocument()
    })

    // API should not be called
    expect(mockCreateClub).not.toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockCreateClub.mockRejectedValue(new Error('Failed to create club'))

    render(
      <AppProvider>
        <CreateClubForm />
      </AppProvider>
    )

    // Fill out the form
    await user.type(screen.getByLabelText(/club name/i), 'My New Book Club')
    await user.selectOptions(screen.getByLabelText(/club type/i), 'BOOK_CLUB')
    await user.type(screen.getByLabelText(/min recommendations/i), '3')
    await user.type(screen.getByLabelText(/max recommendations/i), '5')
    await user.type(screen.getByLabelText(/voting points/i), '[3,2,1]')
    await user.selectOptions(screen.getByLabelText(/turn order/i), 'SEQUENTIAL')
    await user.selectOptions(screen.getByLabelText(/tie breaking method/i), 'RANDOM')
    await user.type(screen.getByLabelText(/minimum participation/i), '80')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create club/i)).toBeInTheDocument()
    })

    // Should not navigate away
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('allows canceling form and returning to dashboard', async () => {
    const user = userEvent.setup()

    render(
      <AppProvider>
        <CreateClubForm />
      </AppProvider>
    )

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Should navigate back to dashboard
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
