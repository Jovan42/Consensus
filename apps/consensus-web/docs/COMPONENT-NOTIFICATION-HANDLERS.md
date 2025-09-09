# Component-Specific Notification Handlers

This system allows each component to register its own handlers for specific notification types, providing better separation of concerns and reducing duplicate requests.

> **📋 For a complete reference of all notification types and their UI refresh behavior, see [NOTIFICATION-SYSTEM-REFERENCE.md](../../../docs/NOTIFICATION-SYSTEM-REFERENCE.md)**

## How It Works

1. **Event Emission**: The notification context receives socket events and emits them to the notification event manager
2. **Component Registration**: Components register handlers for specific notification types
3. **Event Processing**: When events are emitted, all relevant component handlers are called
4. **Deduplication**: The request deduplication system prevents duplicate API calls

## Usage

### Basic Usage

```tsx
import { useNotificationHandler } from '../hooks/useNotificationHandler';

function MyComponent() {
  useNotificationHandler({
    component: 'MyComponent',
    notificationTypes: ['member_added', 'member_removed'],
    handler: (event) => {
      console.log('My component received notification:', event);
      
      if (event.type === 'member_added') {
        // Handle member added
        refreshMembersList();
      } else if (event.type === 'member_removed') {
        // Handle member removed
        refreshMembersList();
      }
    },
    priority: 10 // Optional: higher priority handlers run first
  });

  return <div>My Component</div>;
}
```

### Advanced Usage

```tsx
function VotingComponent() {
  // Handle multiple notification types
  useNotificationHandler({
    component: 'VotingComponent',
    notificationTypes: ['vote_cast', 'voting_completed', 'round_started'],
    handler: (event) => {
      switch (event.type) {
        case 'vote_cast':
          updateVoteCounts(event.data);
          break;
        case 'voting_completed':
          showCompletionMessage();
          break;
        case 'round_started':
          enableVoting();
          break;
      }
    },
    priority: 5
  });

  // Handle all notifications (wildcard)
  useNotificationHandler({
    component: 'VotingComponentDebug',
    notificationTypes: ['*'],
    handler: (event) => {
      console.log('All notifications:', event);
    },
    priority: 1 // Low priority
  });

  return <div>Voting Component</div>;
}
```

## Available Notification Types

- `member_added` - When a new member is added to a club
- `member_removed` - When a member is removed from a club
- `member_role_changed` - When a member's role changes
- `vote_cast` - When someone votes
- `voting_completed` - When voting is completed
- `recommendation_added` - When a recommendation is added
- `recommendation_removed` - When a recommendation is removed
- `completion_updated` - When completion status is updated
- `notification_created` - When a new notification is created
- `*` - Wildcard for all notification types

## Event Data Structure

```typescript
interface NotificationEvent {
  type: string;
  data: any;
  timestamp: number;
}
```

The `data` object typically contains:
- `clubId` - The club ID (for club-specific events)
- `roundId` - The round ID (for round-specific events)
- `memberId` - The member ID (for member-specific events)
- Other relevant data depending on the event type

## Priority System

Handlers can specify a priority (default: 0). Higher priority handlers are called first:

```tsx
useNotificationHandler({
  component: 'HighPriorityHandler',
  notificationTypes: ['member_added'],
  handler: (event) => {
    // This runs first
  },
  priority: 10
});

useNotificationHandler({
  component: 'LowPriorityHandler',
  notificationTypes: ['member_added'],
  handler: (event) => {
    // This runs after high priority handlers
  },
  priority: 1
});
```

## Best Practices

1. **Be Specific**: Only register for notification types your component actually needs
2. **Check Context**: Always check if the event is relevant to your component (e.g., same clubId)
3. **Use Priority**: Use priority to control the order of handler execution
4. **Clean Up**: Handlers are automatically cleaned up when components unmount
5. **Avoid Side Effects**: Keep handlers focused on updating component state

## Example: Members Page

```tsx
function ClubMembers() {
  const { members, mutate } = useClubMembers(clubId);

  useNotificationHandler({
    component: 'MembersPage',
    notificationTypes: ['member_added', 'member_removed', 'member_role_changed'],
    handler: (event) => {
      // Only handle events for this specific club
      if (event.data.clubId === clubId) {
        switch (event.type) {
          case 'member_added':
          case 'member_removed':
          case 'member_role_changed':
            mutate(); // Refresh members list
            break;
        }
      }
    },
    priority: 10
  });

  return <div>Members List</div>;
}
```

## Benefits

1. **Separation of Concerns**: Each component handles its own notifications
2. **Reduced Duplicate Requests**: Request deduplication prevents multiple API calls
3. **Better Performance**: Only relevant components respond to events
4. **Easier Debugging**: Clear logging shows which components handle which events
5. **Flexible**: Components can register for multiple notification types
6. **Automatic Cleanup**: Handlers are automatically removed when components unmount

## Migration from Centralized System

The old centralized system in `NotificationContext` has been updated to emit events instead of handling everything centrally. This means:

- Existing functionality is preserved
- Components can gradually adopt the new system
- The notification context still handles notification fetching and display
- Socket events are now distributed to component handlers
