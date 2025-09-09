'use client';

/**
 * Notification Event System
 * Allows components to register their own handlers for specific notification types
 */

export interface NotificationEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface NotificationHandler {
  id: string;
  component: string;
  notificationTypes: string[];
  handler: (event: NotificationEvent) => void;
  priority?: number; // Higher priority handlers are called first
}

class NotificationEventManager {
  private handlers = new Map<string, NotificationHandler>();
  private eventQueue: NotificationEvent[] = [];
  private isProcessing = false;

  /**
   * Register a notification handler for a component
   */
  registerHandler(handler: NotificationHandler): () => void {
    this.handlers.set(handler.id, handler);
    console.log(`[NotificationEvents] Registered handler for ${handler.component}:`, handler.notificationTypes);
    
    // Return unregister function
    return () => {
      this.handlers.delete(handler.id);
      console.log(`[NotificationEvents] Unregistered handler for ${handler.component}`);
    };
  }

  /**
   * Emit a notification event to all relevant handlers
   */
  emitEvent(type: string, data: any): void {
    const event: NotificationEvent = {
      type,
      data,
      timestamp: Date.now()
    };

    console.log(`[NotificationEvents] Emitting event:`, event);
    
    // Add to queue for processing
    this.eventQueue.push(event);
    
    // Process events asynchronously to avoid blocking
    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  /**
   * Process the event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (!event) continue;

      await this.processEvent(event);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single event
   */
  private async processEvent(event: NotificationEvent): Promise<void> {
    // Find all handlers that match this notification type
    const relevantHandlers = Array.from(this.handlers.values())
      .filter(handler => 
        handler.notificationTypes.includes(event.type) || 
        handler.notificationTypes.includes('*') // Wildcard for all events
      )
      .sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Sort by priority

    console.log(`[NotificationEvents] Found ${relevantHandlers.length} handlers for event type: ${event.type}`);

    // Call each handler
    for (const handler of relevantHandlers) {
      try {
        console.log(`[NotificationEvents] Calling handler for ${handler.component}`);
        handler.handler(event);
      } catch (error) {
        console.error(`[NotificationEvents] Error in handler for ${handler.component}:`, error);
      }
    }
  }

  /**
   * Get all registered handlers (for debugging)
   */
  getHandlers(): NotificationHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Clear all handlers (for cleanup)
   */
  clear(): void {
    this.handlers.clear();
    this.eventQueue = [];
  }
}

// Create singleton instance
const notificationEventManager = new NotificationEventManager();

export { notificationEventManager };
export default notificationEventManager;
