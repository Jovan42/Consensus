'use client';

import { useEffect, useRef } from 'react';
import { notificationEventManager, NotificationHandler, NotificationEvent } from '../utils/notificationEvents';

interface UseNotificationHandlerOptions {
  component: string;
  notificationTypes: string[];
  handler: (event: NotificationEvent) => void;
  priority?: number;
  enabled?: boolean;
}

/**
 * Hook for components to register their own notification handlers
 * 
 * @example
 * ```tsx
 * useNotificationHandler({
 *   component: 'MembersPage',
 *   notificationTypes: ['MEMBER_ADDED', 'MEMBER_REMOVED', 'MEMBER_ROLE_CHANGED'],
 *   handler: (event) => {
 *     console.log('Members page received notification:', event);
 *     // Handle the notification specific to this component
 *     if (event.type === 'MEMBER_ADDED') {
 *       // Refresh members list
 *       mutate('/clubs/123/members');
 *     }
 *   },
 *   priority: 10
 * });
 * ```
 */
export function useNotificationHandler({
  component,
  notificationTypes,
  handler,
  priority = 0,
  enabled = true
}: UseNotificationHandlerOptions): void {
  const handlerRef = useRef<NotificationHandler | null>(null);
  const handlerIdRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    // Generate unique handler ID
    const handlerId = `${component}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    handlerIdRef.current = handlerId;

    // Create handler object
    const notificationHandler: NotificationHandler = {
      id: handlerId,
      component,
      notificationTypes,
      handler,
      priority
    };

    // Register the handler
    const unregister = notificationEventManager.registerHandler(notificationHandler);
    handlerRef.current = notificationHandler;

    console.log(`[useNotificationHandler] Registered handler for ${component}:`, notificationTypes);

    // Cleanup function
    return () => {
      console.log(`[useNotificationHandler] Unregistering handler for ${component}`);
      unregister();
      handlerRef.current = null;
    };
  }, [component, notificationTypes, handler, priority, enabled]);

  // Update handler function if it changes
  useEffect(() => {
    if (handlerRef.current && enabled) {
      handlerRef.current.handler = handler;
    }
  }, [handler, enabled]);
}

/**
 * Hook to emit notification events (useful for testing or manual triggering)
 */
export function useNotificationEmitter() {
  return {
    emit: (type: string, data: any) => {
      notificationEventManager.emitEvent(type, data);
    },
    getHandlers: () => notificationEventManager.getHandlers()
  };
}
