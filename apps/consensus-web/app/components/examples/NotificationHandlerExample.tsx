'use client';

import React from 'react';
import { useNotificationHandler } from '../../hooks/useNotificationHandler';

/**
 * Example component showing how to use component-specific notification handlers
 * This is just for demonstration - you can delete this file
 */
export function NotificationHandlerExample() {
  // Example 1: Handle voting-related notifications
  useNotificationHandler({
    component: 'VotingComponent',
    notificationTypes: ['vote_cast', 'voting_completed'],
    handler: (event) => {
      console.log('Voting component received notification:', event);
      
      if (event.type === 'vote_cast') {
        // Refresh vote counts
        console.log('Refreshing vote counts...');
      } else if (event.type === 'voting_completed') {
        // Show completion message
        console.log('Voting completed!');
      }
    },
    priority: 5
  });

  // Example 2: Handle recommendation notifications
  useNotificationHandler({
    component: 'RecommendationsComponent',
    notificationTypes: ['recommendation_added', 'recommendation_removed'],
    handler: (event) => {
      console.log('Recommendations component received notification:', event);
      
      if (event.type === 'recommendation_added') {
        // Add new recommendation to the list
        console.log('New recommendation added:', event.data);
      } else if (event.type === 'recommendation_removed') {
        // Remove recommendation from the list
        console.log('Recommendation removed:', event.data);
      }
    }
  });

  // Example 3: Handle all notifications (wildcard)
  useNotificationHandler({
    component: 'GlobalNotificationHandler',
    notificationTypes: ['*'], // Wildcard for all events
    handler: (event) => {
      console.log('Global handler received notification:', event);
      
      // Log all notifications for debugging
      console.log(`Notification: ${event.type} at ${new Date(event.timestamp).toISOString()}`);
    },
    priority: 1 // Low priority so other handlers run first
  });

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Notification Handler Examples</h3>
      <p className="text-sm text-muted-foreground">
        This component demonstrates how to use component-specific notification handlers.
        Check the console to see the handlers in action.
      </p>
    </div>
  );
}
