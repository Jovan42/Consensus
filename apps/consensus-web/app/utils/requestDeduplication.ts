'use client';

/**
 * Request deduplication utility to prevent duplicate HTTP requests
 * This helps avoid multiple identical requests being made simultaneously
 */

interface PendingRequest {
  promise: Promise<Response>;
  timestamp: number;
  response?: Response;
}

class RequestDeduplication {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute

  constructor() {
    // Clean up old requests periodically
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Generate a unique key for a request based on URL, method, and body
   */
  private generateRequestKey(url: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    
    return `${method}:${url}:${body}:${headers}`;
  }

  /**
   * Clean up expired pending requests
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Deduplicate a fetch request
   * If the same request is already pending, return the existing promise
   * Otherwise, make a new request and cache the promise
   */
  async deduplicatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const key = this.generateRequestKey(url, options);
    const now = Date.now();

    // Check if we already have a pending request for this key
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      // Check if the existing request is still valid (not expired)
      if (now - existingRequest.timestamp < this.REQUEST_TIMEOUT) {
        console.log(`[RequestDeduplication] Reusing pending request for: ${url}`);
        // If we have a cached response, clone it for this caller
        if (existingRequest.response) {
          return Promise.resolve(existingRequest.response.clone());
        }
        // Otherwise, return the promise and clone the response when it resolves
        return existingRequest.promise.then(response => response.clone());
      } else {
        // Remove expired request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    console.log(`[RequestDeduplication] Making new request for: ${url}`);
    const promise = fetch(url, options).then(response => {
      // Cache the response for future callers
      const cachedRequest = this.pendingRequests.get(key);
      if (cachedRequest) {
        cachedRequest.response = response.clone();
      }
      return response;
    }).finally(() => {
      // Remove from pending requests when completed
      this.pendingRequests.delete(key);
    });

    // Cache the promise
    this.pendingRequests.set(key, {
      promise,
      timestamp: now
    });

    return promise;
  }

  /**
   * Clear all pending requests (useful for cleanup or testing)
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get the number of pending requests (useful for debugging)
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Create a singleton instance
const requestDeduplication = new RequestDeduplication();

export { requestDeduplication };
export default requestDeduplication;
