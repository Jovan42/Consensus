import { render, screen } from '@testing-library/react'

describe('Simple Test', () => {
  it('should render a simple div', () => {
    render(<div data-testid="test-div">Hello Test</div>)
    expect(screen.getByTestId('test-div')).toBeInTheDocument()
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })

  it('should pass a basic math test', () => {
    expect(2 + 2).toBe(4)
  })
})
