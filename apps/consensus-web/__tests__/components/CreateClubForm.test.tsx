import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import CreateClubForm from '../../app/clubs/create-club/page'

// Mock the API hooks
const mockCreateClub = jest.fn()
jest.mock('../../app/hooks/useApi', () => ({
  useCreateClub: () => mockCreateClub,
}))

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('CreateClubForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<CreateClubForm />)
    
    expect(screen.getByLabelText(/club name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/club type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/min recommendations/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max recommendations/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/voting points/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/turn order/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tie breaking method/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/minimum participation/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<CreateClubForm />)
    
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/club name is required/i)).toBeInTheDocument()
    })
  })

  it('validates min recommendations is less than max recommendations', async () => {
    const user = userEvent.setup()
    render(<CreateClubForm />)
    
    const minInput = screen.getByLabelText(/min recommendations/i)
    const maxInput = screen.getByLabelText(/max recommendations/i)
    
    await user.type(minInput, '5')
    await user.type(maxInput, '3')
    
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/min recommendations must be less than max/i)).toBeInTheDocument()
    })
  })

  it('validates voting points format', async () => {
    const user = userEvent.setup()
    render(<CreateClubForm />)
    
    const votingPointsInput = screen.getByLabelText(/voting points/i)
    await user.clear(votingPointsInput)
    await user.type(votingPointsInput, 'invalid format')
    
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/voting points must be a valid array/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockCreateClub.mockResolvedValue({ success: true, data: { id: 'new-club-id' } })
    
    render(<CreateClubForm />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/club name/i), 'My Test Club')
    await user.selectOptions(screen.getByLabelText(/club type/i), 'BOOK_CLUB')
    await user.type(screen.getByLabelText(/min recommendations/i), '3')
    await user.type(screen.getByLabelText(/max recommendations/i), '5')
    await user.type(screen.getByLabelText(/voting points/i), '[3,2,1]')
    await user.selectOptions(screen.getByLabelText(/turn order/i), 'SEQUENTIAL')
    await user.selectOptions(screen.getByLabelText(/tie breaking method/i), 'RANDOM')
    await user.type(screen.getByLabelText(/minimum participation/i), '80')
    
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateClub).toHaveBeenCalledWith({
        name: 'My Test Club',
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
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()
    mockCreateClub.mockRejectedValue(new Error('Failed to create club'))
    
    render(<CreateClubForm />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/club name/i), 'My Test Club')
    await user.selectOptions(screen.getByLabelText(/club type/i), 'BOOK_CLUB')
    await user.type(screen.getByLabelText(/min recommendations/i), '3')
    await user.type(screen.getByLabelText(/max recommendations/i), '5')
    await user.type(screen.getByLabelText(/voting points/i), '[3,2,1]')
    await user.selectOptions(screen.getByLabelText(/turn order/i), 'SEQUENTIAL')
    await user.selectOptions(screen.getByLabelText(/tie breaking method/i), 'RANDOM')
    await user.type(screen.getByLabelText(/minimum participation/i), '80')
    
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to create club/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockCreateClub.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<CreateClubForm />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/club name/i), 'My Test Club')
    await user.selectOptions(screen.getByLabelText(/club type/i), 'BOOK_CLUB')
    await user.type(screen.getByLabelText(/min recommendations/i), '3')
    await user.type(screen.getByLabelText(/max recommendations/i), '5')
    await user.type(screen.getByLabelText(/voting points/i), '[3,2,1]')
    await user.selectOptions(screen.getByLabelText(/turn order/i), 'SEQUENTIAL')
    await user.selectOptions(screen.getByLabelText(/tie breaking method/i), 'RANDOM')
    await user.type(screen.getByLabelText(/minimum participation/i), '80')
    
    const submitButton = screen.getByRole('button', { name: /create club/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/creating club/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('navigates back when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateClubForm />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
