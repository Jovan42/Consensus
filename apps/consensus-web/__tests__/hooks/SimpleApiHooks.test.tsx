import { renderHook } from '@testing-library/react'

// Mock fetch for this test
const mockFetch = jest.fn()
global.fetch = mockFetch

// Simple API hook for testing
const useSimpleApi = () => {
  const fetchData = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  return { fetchData, postData }
}

describe('Simple API Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create fetch and post functions', () => {
    const { result } = renderHook(() => useSimpleApi())
    
    expect(typeof result.current.fetchData).toBe('function')
    expect(typeof result.current.postData).toBe('function')
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useSimpleApi())
    const data = await result.current.fetchData('/api/test')

    expect(mockFetch).toHaveBeenCalledWith('/api/test')
    expect(data).toEqual(mockData)
  })

  it('should post data successfully', async () => {
    const postPayload = { name: 'New Item' }
    const mockResponse = { id: 2, ...postPayload }
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useSimpleApi())
    const data = await result.current.postData('/api/items', postPayload)

    expect(mockFetch).toHaveBeenCalledWith('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
    })
    expect(data).toEqual(mockResponse)
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    const { result } = renderHook(() => useSimpleApi())
    
    await expect(result.current.fetchData('/api/notfound')).rejects.toThrow('HTTP error! status: 404')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useSimpleApi())
    
    await expect(result.current.fetchData('/api/test')).rejects.toThrow('Network error')
  })
})
