# Error Handling System

This document describes the comprehensive error handling system implemented in the Consensus application, including toast notifications, HTTP error handling, and user-friendly error messages.

## Overview

The error handling system provides:
- **Toast notifications** that appear and automatically disappear
- **HTTP error handling** with specific messages for different status codes
- **Context-aware error messages** that help users understand what went wrong
- **Automatic retry logic** for certain types of errors
- **Global error state management** using React Context

## Components

### 1. Toast Component (`Toast.tsx`)

A reusable toast notification component that supports different types:
- **Success** - Green with checkmark icon
- **Error** - Red with alert circle icon  
- **Warning** - Yellow with warning triangle icon
- **Info** - Blue with info icon

**Features:**
- Automatic dismissal after configurable duration
- Manual dismissal with X button
- Smooth animations (slide in/out, fade, scale)
- Action buttons for additional functionality
- Responsive design

### 2. Toast Container (`ToastContainer.tsx`)

Manages multiple toast notifications:
- Fixed positioning in top-right corner
- Stacked display with proper spacing
- Z-index management for proper layering

### 3. Error Context (`ErrorContext.tsx`)

Global error state management with the following methods:

```typescript
interface ErrorContextType {
  showError: (message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  handleHttpError: (error: any, context?: string) => void;
}
```

## HTTP Error Handling

The system automatically handles different HTTP status codes with appropriate messages:

### 400 - Bad Request
- **Message:** "Invalid request. Please check your input."
- **Duration:** 7 seconds

### 401 - Unauthorized  
- **Message:** "You are not authorized to perform this action. Please log in again."
- **Duration:** 8 seconds

### 403 - Forbidden
- **Message:** "You do not have permission to access this resource."
- **Duration:** 8 seconds
- **Special handling:** Used in member notes with retry logic

### 404 - Not Found
- **Message:** "The requested resource was not found."
- **Duration:** 7 seconds

### 409 - Conflict
- **Message:** "This action conflicts with existing data."
- **Duration:** 7 seconds

### 422 - Validation Error
- **Message:** "Please check your input and try again."
- **Duration:** 7 seconds

### 429 - Too Many Requests
- **Message:** "You are making requests too quickly. Please wait a moment and try again."
- **Duration:** 10 seconds

### 500 - Server Error
- **Message:** "The server encountered an error. Please try again later."
- **Duration:** 10 seconds

### 502/503/504 - Service Unavailable
- **Message:** "The service is temporarily unavailable. Please try again later."
- **Duration:** 10 seconds

### Network Errors
- **Message:** "Unable to connect to the server. Please check your internet connection."
- **Duration:** 10 seconds

### Timeout Errors
- **Message:** "The request took too long to complete. Please try again."
- **Duration:** 8 seconds

## Usage Examples

### Basic Toast Notifications

```typescript
import { useError } from '../contexts/ErrorContext';

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useError();

  const handleAction = () => {
    try {
      // Some operation
      showSuccess('Operation completed successfully!');
    } catch (error) {
      showError('Something went wrong!');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### HTTP Error Handling

```typescript
import { useError } from '../contexts/ErrorContext';

function MyComponent() {
  const { handleHttpError } = useError();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        const errorData = await response.json();
        const error = {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          }
        };
        handleHttpError(error, 'Data Fetching');
      }
    } catch (error) {
      handleHttpError(error, 'Data Fetching');
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

### Using the API Hook with Error Handling

```typescript
import { useApiWithErrorHandling } from '../hooks/useApiWithErrorHandling';

function MyComponent() {
  const { get, post, put, delete: del } = useApiWithErrorHandling();

  const handleGetData = async () => {
    const data = await get('/api/data', 'Data Fetching');
    if (data) {
      // Handle successful response
    }
  };

  const handlePostData = async () => {
    const result = await post(
      '/api/data', 
      { name: 'test' }, 
      'Data Creation',
      true, // Show success message
      'Data created successfully!' // Success message
    );
  };

  return (
    <div>
      <button onClick={handleGetData}>Get Data</button>
      <button onClick={handlePostData}>Create Data</button>
    </div>
  );
}
```

### SWR Integration

```typescript
import { useSWRWithErrorHandling } from '../hooks/useSWRWithErrorHandling';

function MyComponent() {
  const { data, error, isLoading } = useSWRWithErrorHandling(
    '/api/data',
    undefined,
    {
      context: 'Data Loading',
      showErrorToast: true
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## Integration with Existing Code

### Member Notes Example

The member notes functionality now includes comprehensive error handling:

```typescript
export function useMemberNote(roundId: string) {
  const { handleHttpError } = useError();
  
  const { data, error, isLoading, mutate } = useSWR(
    roundId ? `/member-notes/round/${roundId}` : null,
    async (url: string) => {
      try {
        return await api.get(url);
      } catch (error: any) {
        // Handle 404 as "note doesn't exist" - not an error
        if (error.message?.includes('404')) {
          return null;
        }
        // Handle 403 with retry logic
        if (error.message?.includes('403')) {
          console.log('Member notes 403 error, retrying after delay...');
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            return await api.get(url);
          } catch (retryError: any) {
            if (retryError.message?.includes('403')) {
              handleHttpError(retryError, 'Member Notes');
              throw new Error('Access denied: You are not a member of this club');
            }
            handleHttpError(retryError, 'Member Notes');
            throw retryError;
          }
        }
        // Show error toast for other errors
        handleHttpError(error, 'Member Notes');
        throw error;
      }
    }
  );
  
  return { note: data, error, isLoading, mutate };
}
```

## Configuration

### Toast Durations

Default durations for different toast types:
- **Success:** 3 seconds
- **Info:** 4 seconds  
- **Warning:** 5 seconds
- **Error:** 7 seconds
- **Network/Server errors:** 8-10 seconds

### Customization

You can customize toast behavior by passing options:

```typescript
showError('Custom error message', 'Custom Title', 10000); // 10 seconds
showSuccess('Quick success', undefined, 1000); // 1 second
showToast({
  type: 'info',
  message: 'Custom toast',
  duration: 0, // No auto-dismiss
  action: {
    label: 'Retry',
    onClick: () => console.log('Retry clicked')
  }
});
```

## Testing

### Manual Testing

Use the `ErrorHandlingExample` component to test different error scenarios:

```typescript
import ErrorHandlingExample from '../components/examples/ErrorHandlingExample';

// In your test page
<ErrorHandlingExample />
```

### Test Scenarios

1. **Toast Types:** Test success, error, warning, and info toasts
2. **HTTP Errors:** Test 403, 404, 500, and network errors
3. **Auto-dismiss:** Verify toasts disappear after the correct duration
4. **Manual dismiss:** Test clicking the X button
5. **Multiple toasts:** Test stacking behavior
6. **Context messages:** Verify context is included in error titles

## Best Practices

### Error Messages

1. **Be specific:** Include context about what operation failed
2. **Be helpful:** Provide guidance on what the user can do
3. **Be concise:** Keep messages short and clear
4. **Use appropriate tone:** Match the severity of the error

### Error Handling

1. **Handle errors at the right level:** Use context for global errors, local state for component-specific errors
2. **Provide fallbacks:** Always have a fallback UI state
3. **Log errors:** Use console.error for debugging
4. **Retry logic:** Implement retry for transient errors
5. **User feedback:** Always inform users when something goes wrong

### Performance

1. **Limit toast count:** Don't show too many toasts at once
2. **Auto-dismiss:** Use appropriate durations to avoid UI clutter
3. **Memory management:** Clean up toast state properly
4. **Debounce:** Avoid showing duplicate error messages

## Troubleshooting

### Common Issues

1. **Toasts not appearing:** Check if ErrorProvider is properly set up
2. **Errors not handled:** Verify error context is being used
3. **Duplicate toasts:** Check for multiple error handlers
4. **Memory leaks:** Ensure proper cleanup of toast state

### Debug Mode

Enable debug logging:

```typescript
// In ErrorContext
console.log('Showing error toast:', { message, title, duration });

// In components
console.log('HTTP Error:', error);
```

## Future Enhancements

### Planned Features

1. **Persistent errors:** Store critical errors in localStorage
2. **Error reporting:** Send error reports to monitoring service
3. **User preferences:** Allow users to customize error handling
4. **Offline support:** Handle offline scenarios gracefully
5. **Error analytics:** Track error patterns and frequency

### Performance Improvements

1. **Toast pooling:** Reuse toast components for better performance
2. **Lazy loading:** Load error handling code only when needed
3. **Batch updates:** Group multiple error messages
4. **Memory optimization:** Implement better cleanup strategies
