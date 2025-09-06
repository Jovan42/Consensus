import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import Dashboard from '../../app/page'
import { mockClub } from '../utils/test-utils'

// Mock the API hooks
jest.mock('../../app/hooks/useApi', () => ({
  useGetClubs: () => ({
    data: [mockClub],
    error: null,
    isLoading: false,
    mutate: jest.fn(),
  }),
}))

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dashboard with clubs', async () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Test Book Club')).toBeInTheDocument()
  })

  it('displays club type icon correctly', () => {
    render(<Dashboard />)
    
    // Check if the book icon is present (for BOOK_CLUB type)
    const bookIcon = screen.getByTestId('book-icon')
    expect(bookIcon).toBeInTheDocument()
  })

  it('shows member count', () => {
    render(<Dashboard />)
    
    // The member count should be displayed
    expect(screen.getByText('0 members')).toBeInTheDocument()
  })

  it('navigates to club details when club card is clicked', async () => {
    render(<Dashboard />)
    
    const clubCard = screen.getByText('Test Book Club').closest('div')
    if (clubCard) {
      fireEvent.click(clubCard)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/clubs/test-club-id')
      })
    }
  })

  it('shows create club button', () => {
    render(<Dashboard />)
    
    const createButton = screen.getByRole('button', { name: /create club/i })
    expect(createButton).toBeInTheDocument()
  })

  it('navigates to create club page when button is clicked', async () => {
    render(<Dashboard />)
    
    const createButton = screen.getByRole('button', { name: /create club/i })
    fireEvent.click(createButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/clubs/create-club')
    })
  })

  it('displays loading state', () => {
    // Mock loading state
    jest.doMock('../../app/hooks/useApi', () => ({
      useGetClubs: () => ({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: jest.fn(),
      }),
    }))

    render(<Dashboard />)
    
    expect(screen.getByText('Loading clubs...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    // Mock error state
    jest.doMock('../../app/hooks/useApi', () => ({
      useGetClubs: () => ({
        data: undefined,
        error: new Error('Failed to fetch clubs'),
        isLoading: false,
        mutate: jest.fn(),
      }),
    }))

    render(<Dashboard />)
    
    expect(screen.getByText('Error loading clubs')).toBeInTheDocument()
  })

  it('displays empty state when no clubs exist', () => {
    // Mock empty data
    jest.doMock('../../app/hooks/useApi', () => ({
      useGetClubs: () => ({
        data: [],
        error: null,
        isLoading: false,
        mutate: jest.fn(),
      }),
    }))

    render(<Dashboard />)
    
    expect(screen.getByText('No clubs found')).toBeInTheDocument()
    expect(screen.getByText('Create your first club to get started!')).toBeInTheDocument()
  })
})
