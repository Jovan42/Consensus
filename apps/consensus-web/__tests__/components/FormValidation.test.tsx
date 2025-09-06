import { render, screen, fireEvent, waitFor } from '../utils/simple-test-utils'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

// Simple form component for testing validation
const SimpleForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = validateForm()
    if (isValid) {
      setIsSubmitted(true)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isSubmitted) {
    return <div data-testid="success">Form submitted successfully!</div>
  }

  return (
    <form onSubmit={handleSubmit} data-testid="simple-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          data-testid="name-input"
        />
        {errors.name && <div data-testid="name-error">{errors.name}</div>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          data-testid="email-input"
        />
        {errors.email && <div data-testid="email-error">{errors.email}</div>}
      </div>
      
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  )
}

describe('Form Validation', () => {
  it('renders form fields', () => {
    render(<SimpleForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<SimpleForm />)
    
    const form = screen.getByTestId('simple-form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required')
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required')
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<SimpleForm />)
    
    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const form = screen.getByTestId('simple-form')
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'invalid-email')
    
    // Check that the form has the invalid email value
    expect(emailInput).toHaveValue('invalid-email')
    
    // Try using fireEvent.submit directly on the form
    fireEvent.submit(form)
    
    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is invalid')
    }, { timeout: 3000 })
  })

  it('clears errors when user types', async () => {
    const user = userEvent.setup()
    render(<SimpleForm />)
    
    const nameInput = screen.getByTestId('name-input')
    const submitButton = screen.getByTestId('submit-button')
    
    // First trigger error
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument()
    })
    
    // Then type to clear error
    await user.type(nameInput, 'John')
    
    await waitFor(() => {
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument()
    })
  })

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup()
    render(<SimpleForm />)
    
    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const form = screen.getByTestId('simple-form')
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByTestId('success')).toHaveTextContent('Form submitted successfully!')
    })
  })
})
