import { render, screen, act } from '@testing-library/react'
import { AppProvider, useAppContext } from '../../context/AppContext'
import { mockClub, mockMember } from '../utils/test-utils'

// Test component to access context
const TestComponent = () => {
  const { currentClub, setCurrentClub, currentMember, setCurrentMember } = useAppContext()
  
  return (
    <div>
      <div data-testid="current-club">{currentClub?.name || 'No club'}</div>
      <div data-testid="current-member">{currentMember?.name || 'No member'}</div>
      <button onClick={() => setCurrentClub(mockClub)}>Set Club</button>
      <button onClick={() => setCurrentMember(mockMember)}>Set Member</button>
      <button onClick={() => setCurrentClub(null)}>Clear Club</button>
      <button onClick={() => setCurrentMember(null)}>Clear Member</button>
    </div>
  )
}

describe('AppContext', () => {
  it('provides initial state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    expect(screen.getByTestId('current-club')).toHaveTextContent('No club')
    expect(screen.getByTestId('current-member')).toHaveTextContent('No member')
  })

  it('updates current club', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    const setClubButton = screen.getByText('Set Club')
    act(() => {
      setClubButton.click()
    })
    
    expect(screen.getByTestId('current-club')).toHaveTextContent('Test Book Club')
  })

  it('updates current member', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    const setMemberButton = screen.getByText('Set Member')
    act(() => {
      setMemberButton.click()
    })
    
    expect(screen.getByTestId('current-member')).toHaveTextContent('John Doe')
  })

  it('clears current club', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    // First set a club
    const setClubButton = screen.getByText('Set Club')
    act(() => {
      setClubButton.click()
    })
    
    expect(screen.getByTestId('current-club')).toHaveTextContent('Test Book Club')
    
    // Then clear it
    const clearClubButton = screen.getByText('Clear Club')
    act(() => {
      clearClubButton.click()
    })
    
    expect(screen.getByTestId('current-club')).toHaveTextContent('No club')
  })

  it('clears current member', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    // First set a member
    const setMemberButton = screen.getByText('Set Member')
    act(() => {
      setMemberButton.click()
    })
    
    expect(screen.getByTestId('current-member')).toHaveTextContent('John Doe')
    
    // Then clear it
    const clearMemberButton = screen.getByText('Clear Member')
    act(() => {
      clearMemberButton.click()
    })
    
    expect(screen.getByTestId('current-member')).toHaveTextContent('No member')
  })

  it('maintains state across re-renders', () => {
    const { rerender } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    // Set club
    const setClubButton = screen.getByText('Set Club')
    act(() => {
      setClubButton.click()
    })
    
    expect(screen.getByTestId('current-club')).toHaveTextContent('Test Book Club')
    
    // Re-render
    rerender(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    // State should persist
    expect(screen.getByTestId('current-club')).toHaveTextContent('Test Book Club')
  })
})
