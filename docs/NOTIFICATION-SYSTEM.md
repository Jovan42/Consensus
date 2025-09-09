# Notification System Documentation

This document provides comprehensive information about the Consensus notification system, including implementation details, usage examples, and testing procedures.

> **📋 For a complete reference of all notification types and their UI refresh behavior, see [NOTIFICATION-SYSTEM-REFERENCE.md](./NOTIFICATION-SYSTEM-REFERENCE.md)**

## 📋 Overview

The notification system provides real-time updates and persistent notification history for club activities. When users perform actions like voting or adding recommendations, notifications are automatically created for all club members and stored in the database.

## 🏗️ Architecture

### Backend Components

1. **Notification Entity** (`/apps/consensus-api/src/entities/Notification.ts`)
   - Database table with status tracking (read/unread)
   - Support for different notification types
   - JSONB data field for storing additional context
   - Proper relationships with Club, Member, and Round entities

2. **Notification Service** (`/apps/consensus-api/src/services/notificationService.ts`)
   - Create notifications for individual members or entire clubs
   - Fetch unread notifications and counts
   - Mark notifications as read (individual or bulk)
   - Automatic cleanup of old notifications

3. **Notification Controller** (`/apps/consensus-api/src/controllers/notificationController.ts`)
   - REST API endpoints for all notification operations
   - Proper authentication and authorization
   - Pagination support for notification history

4. **Database Migration** (`/apps/consensus-api/src/migrations/1704240000000-AddNotifications.ts`)
   - Creates notifications table with proper indexes
   - Adds notification type and status enums
   - Optimized for performance with composite indexes

### Frontend Components

1. **Notification Context** (`/apps/consensus-web/app/contexts/NotificationContext.tsx`)
   - React context for managing notification state
   - Automatic fetching and periodic refresh
   - Real-time updates via WebSocket
   - Error handling and loading states

2. **Notification Icon Component** (`/apps/consensus-web/app/components/notifications/NotificationIcon.tsx`)
   - Bell icon with unread count badge
   - Dropdown showing recent unread notifications
   - Click to mark as read functionality
   - Beautiful UI with proper styling and animations

3. **Notifications History Page** (`/apps/consensus-web/app/notifications/page.tsx`)
   - Complete notification history with pagination
   - Mark individual or all notifications as read
   - Different icons for different notification types
   - Responsive design with proper loading states

## 🔄 How It Works

### 1. Notification Creation

When certain events occur in the application, notifications are automatically created:

```typescript
// Example: When someone votes
await NotificationService.createAndEmitClubNotification(req, {
  type: NotificationType.VOTE_CAST,
  title: 'Vote Submitted',
  message: `${member.name} has submitted their vote for this round`,
  clubId: round.clubId,
  roundId: roundId,
  data: {
    voterName: member.name,
    voterId: memberId,
    roundId: roundId
  }
});
```

### 2. Real-time Updates

Notifications are both saved to the database AND emitted via WebSocket:

```typescript
// Emit real-time notification
const socketManager = getSocketManager(req);
emitNotification(
  socketManager,
  'info',
  data.title,
  data.message,
  data.clubId,
  data.roundId
);
```

### 3. Frontend Integration

The frontend automatically fetches and displays notifications:

```typescript
// Fetch unread count
const { unreadCount } = useNotifications();

// Display in navigation
<NotificationIcon />
```

## 📊 Notification Types

The system supports the following notification types:

| Type | Description | Triggered When |
|------|-------------|----------------|
| `vote_cast` | Vote submitted | A member submits their vote |
| `voting_completed` | Voting finished | Voting is closed and winner determined |
| `recommendation_added` | New recommendations | Recommendations are added to a round |
| `round_started` | Round begins | A new round is started |
| `round_completed` | Round finished | A round is completed |
| `member_added` | Member joins | A new member joins the club |
| `member_removed` | Member leaves | A member leaves the club |
| `member_role_changed` | Role change | A member's role changes |
| `club_updated` | Club settings | Club settings are updated |

## 🛠️ API Endpoints

### GET /api/notifications
Get all notifications for the authenticated user with pagination.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "total": 25,
    "hasMore": true
  }
}
```

### GET /api/notifications/unread
Get all unread notifications for the authenticated user.

### GET /api/notifications/unread/count
Get the count of unread notifications for the authenticated user.

### PUT /api/notifications/:notificationId/read
Mark a specific notification as read.

### PUT /api/notifications/read-all
Mark all notifications as read for the authenticated user.

## 🧪 Testing

### Manual Testing

1. **Create a club with multiple members**
2. **Have one member vote** - all other members should get notifications
3. **Check the notification bell** in the header - should show unread count
4. **Click the bell** - should show recent unread notifications
5. **Visit `/notifications`** - should show complete notification history
6. **Mark notifications as read** - count should decrease

### Automated Testing

Use the Postman collections to test the notification system:

1. **Consensus-Notifications-API.postman_collection.json** - Dedicated notification testing
2. **Consensus-Phase1-API.postman_collection.json** - Includes notification endpoints
3. **Consensus-Happy-Path-Test.postman_collection.json** - Creates notifications during workflow

### Test Scenarios

#### Scenario 1: Vote Notifications
1. Create a club with 4 members
2. Start a round and add recommendations
3. Have one member vote
4. Verify all other members receive vote_cast notifications
5. Check notification data includes voter information

#### Scenario 2: Voting Completion Notifications
1. Complete the voting process
2. Verify all members receive voting_completed notifications
3. Check notification data includes winner information

#### Scenario 3: Recommendation Notifications
1. Have a member add recommendations
2. Verify all members receive recommendation_added notifications
3. Check notification data includes recommendation details

## 🔧 Configuration

### Environment Variables

No additional environment variables are required for the notification system. It uses the existing database and WebSocket configurations.

### Database Configuration

The notification system requires the following database setup:

1. **Run the migration** to create the notifications table
2. **Ensure proper indexes** are created for performance
3. **Set up cleanup job** for old notifications (optional)

### WebSocket Configuration

The notification system integrates with the existing WebSocket setup:

1. **Socket manager** handles real-time notifications
2. **Club-based rooms** ensure notifications reach the right users
3. **Event types** are properly defined and handled

## 📈 Performance Considerations

### Database Optimization

1. **Composite indexes** on (memberId, status) for efficient unread queries
2. **Pagination** for notification history to handle large datasets
3. **Automatic cleanup** of old notifications to prevent table bloat

### Frontend Optimization

1. **Periodic refresh** of unread count (every 30 seconds)
2. **Lazy loading** of notification history
3. **Efficient state management** with React context

### WebSocket Optimization

1. **Club-based rooms** to limit notification scope
2. **Event batching** for multiple notifications
3. **Connection management** for offline users

## 🚀 Deployment

### Database Migration

1. **Run the migration** on your database:
   ```bash
   npm run migration:run
   ```

2. **Verify the table** was created:
   ```sql
   SELECT * FROM notifications LIMIT 1;
   ```

### Application Deployment

1. **Deploy the backend** with the new notification endpoints
2. **Deploy the frontend** with the notification components
3. **Test the integration** in your staging environment

### Monitoring

1. **Monitor notification creation** rates
2. **Track unread notification** counts
3. **Monitor database performance** for notification queries

## 🐛 Troubleshooting

### Common Issues

#### Notifications Not Appearing
1. **Check database connection** - ensure notifications are being saved
2. **Verify WebSocket connection** - check real-time updates
3. **Check authentication** - ensure user is properly authenticated
4. **Review notification creation** - verify events are triggering notifications

#### High Database Load
1. **Check indexes** - ensure proper indexes are in place
2. **Review cleanup job** - ensure old notifications are being removed
3. **Monitor query performance** - check for slow queries

#### Frontend Issues
1. **Check context provider** - ensure NotificationProvider is properly set up
2. **Verify API calls** - check network requests in browser dev tools
3. **Review error handling** - check for JavaScript errors

### Debug Mode

Enable debug logging for the notification system:

```typescript
// In notification service
console.log('Creating notification:', notificationData);

// In frontend context
console.log('Notification state:', { unreadCount, notifications });
```

## 📝 Best Practices

### Backend

1. **Always create notifications** for club-wide events
2. **Include relevant data** in the notification data field
3. **Handle errors gracefully** - don't fail the main operation if notification creation fails
4. **Use proper types** for notification types and statuses

### Frontend

1. **Handle loading states** properly
2. **Show appropriate error messages** when notifications fail to load
3. **Implement proper cleanup** for WebSocket connections
4. **Use optimistic updates** for better user experience

### Database

1. **Regular cleanup** of old notifications
2. **Monitor index usage** and performance
3. **Backup notification data** if needed for analytics
4. **Consider archiving** very old notifications

## 🔮 Future Enhancements

### Planned Features

1. **Email notifications** for important events
2. **Push notifications** for mobile users
3. **Notification preferences** for different event types
4. **Notification templates** for consistent messaging
5. **Analytics dashboard** for notification metrics

### Performance Improvements

1. **Notification batching** for multiple events
2. **Caching layer** for frequently accessed notifications
3. **Background processing** for notification creation
4. **Real-time analytics** for notification engagement

## 📚 Related Documentation

- [API Endpoints](./API-ENDPOINTS.md) - Complete API documentation
- [Database Schema](./DATABASE-SCHEMA.md) - Database structure and relationships
- [Postman Collections](./postman-collections/README.md) - Testing collections
- [Development Guide](./DEVELOPMENT-GUIDE.md) - Development setup and guidelines
