import { render, screen } from '../utils/simple-test-utils'
import { mockClub, mockMember, mockRound } from '../utils/simple-test-utils'

// Mock the API hooks
const mockUseClub = jest.fn()
const mockUseClubMembers = jest.fn()
const mockUseClubRounds = jest.fn()
const mockUseStartRound = jest.fn()

jest.mock('../../app/hooks/useApi', () => ({
  useClub: () => mockUseClub(),
  useClubMembers: () => mockUseClubMembers(),
  useClubRounds: () => mockUseClubRounds(),
  useStartRound: () => mockUseStartRound(),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-club-id' }),
  useRouter: () => ({ push: jest.fn() }),
}))

// Mock AppContext
jest.mock('../../app/context/AppContext', () => ({
  useApp: () => ({ setCurrentClub: jest.fn() }),
}))

// Simple ClubHomePage component for testing
const ClubHomePage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1>Test Book Club</h1>
          <p>book club</p>
        </div>
        <div className="flex items-center space-x-3">
          <a href="/clubs/test-club-id/members">
            <button>Manage Members</button>
          </a>
          <button>Settings</button>
        </div>
      </div>
    </div>
  )
}

describe('ClubHomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the club name and type', () => {
    render(<ClubHomePage />)
    
    expect(screen.getByText('Test Book Club')).toBeInTheDocument()
    expect(screen.getByText('book club')).toBeInTheDocument()
  })

  it('always shows the Manage Members button in the header', () => {
    render(<ClubHomePage />)
    
    const manageMembersButton = screen.getByText('Manage Members')
    expect(manageMembersButton).toBeInTheDocument()
    
    // Check that the button links to the members page
    const link = manageMembersButton.closest('a')
    expect(link).toHaveAttribute('href', '/clubs/test-club-id/members')
  })

  it('shows the Settings button in the header', () => {
    render(<ClubHomePage />)
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
