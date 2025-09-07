# Real-time Features Documentation

## 🚀 Overview

The Consensus application now includes comprehensive real-time features powered by Socket.io, providing instant updates and notifications across all connected users.

## 🔧 Technical Implementation

### Backend (API)
- **Socket.io Server**: Integrated with Express.js server
- **Authentication**: Token-based authentication for socket connections
- **Event Emission**: Structured event system for different types of updates
- **Club-based Broadcasting**: Events are scoped to specific clubs for privacy

### Frontend (Web)
- **Socket.io Client**: Real-time connection management
- **React Context**: Global socket state management
- **SWR Integration**: Automatic cache invalidation on real-time events
- **Notification System**: Visual notification display with auto-removal

## 📡 Real-time Events

### 1. Vote Submission
- **Event**: `vote_cast`
- **Notification**: "Vote Submitted: [Name] has submitted their vote for this round"
- **Type**: Success notification
- **Triggers**: When any member submits their votes

### 2. Voting Closed
- **Event**: `round_status_changed`
- **Notification**: "Voting Complete! Winner: [Recommendation Title]"
- **Type**: Success notification
- **Triggers**: When voting is officially closed and winner determined

### 3. Recommendation Added
- **Event**: `recommendation_added`
- **Notification**: "New Recommendations Added: X new recommendation(s) added by [Name]"
- **Type**: Success notification
- **Triggers**: When new recommendations are submitted

### 4. Completion Status
- **Event**: `completion_updated`
- **Notification**: "Completion Updated: [Name] has marked the recommendation as completed/not completed"
- **Type**: Info notification
- **Triggers**: When someone marks a recommendation as completed

### 5. Member Management
- **Events**: `member_added`, `member_removed`, `member_role_changed`
- **Notifications**: Various member management notifications
- **Type**: Info notifications
- **Triggers**: When members are added, removed, or roles changed

### 6. Round Status Changes
- **Event**: `round_status_changed`
- **Notification**: Status-specific notifications (voting closed, round finished, etc.)
- **Type**: Info/Success notifications
- **Triggers**: When round status is manually updated

## 🎯 User Experience Features

### Notification System
- **Visual Indicator**: Bell icon in navigation with unread count
- **Auto-removal**: Notifications disappear after 10 seconds
- **Persistent Storage**: Notifications remain until manually dismissed
- **Role-based**: All club members receive relevant notifications

### Real-time UI Updates
- **Automatic Refresh**: UI updates instantly when data changes
- **Cache Invalidation**: SWR cache is automatically refreshed
- **No Manual Refresh**: Users never need to refresh the page
- **Seamless Experience**: Changes appear immediately across all connected users

### Admin Features
- **Connection Status**: Admin-only real-time connection indicator
- **Debug Information**: Console logging for troubleshooting
- **Enhanced Monitoring**: Better visibility into real-time system status

## 🔒 Security & Privacy

### Authentication
- **Token-based**: Socket connections require valid authentication tokens
- **Club Scoping**: Events are only sent to members of the relevant club
- **Role-based Access**: Different notification levels based on user roles

### Data Privacy
- **Club Isolation**: Real-time events are scoped to specific clubs
- **Member-only Access**: Only club members receive club-specific notifications
- **Secure Connections**: All socket connections use secure protocols

## 🛠️ Configuration

### Environment Variables
```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend
FRONTEND_URL=http://localhost:3000
```

### Socket Connection
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Error Handling**: Graceful handling of connection errors
- **Fallback**: System works without real-time features if connection fails

## 📊 Performance Considerations

### Optimization
- **Event Debouncing**: Prevents excessive event emissions
- **Selective Updates**: Only relevant data is refreshed
- **Efficient Broadcasting**: Events are scoped to minimize network traffic
- **Memory Management**: Automatic cleanup of old notifications

### Monitoring
- **Connection Status**: Real-time connection monitoring
- **Error Logging**: Comprehensive error logging for debugging
- **Performance Metrics**: Socket connection and event performance tracking

## 🧪 Testing

### Real-time Testing
- **Multiple Users**: Test with multiple browser sessions
- **Event Verification**: Verify all events are received correctly
- **Notification Display**: Test notification appearance and removal
- **UI Updates**: Verify automatic UI updates work correctly

### Error Scenarios
- **Connection Loss**: Test behavior when connection is lost
- **Reconnection**: Verify automatic reconnection works
- **Invalid Events**: Test handling of malformed events
- **Permission Errors**: Test access control for events

## 🚀 Future Enhancements

### Planned Features
- **Push Notifications**: Browser push notifications for important events
- **Email Notifications**: Email alerts for critical updates
- **Mobile Support**: Enhanced mobile real-time experience
- **Offline Support**: Queue events when offline, sync when reconnected

### Performance Improvements
- **Event Compression**: Compress large event payloads
- **Selective Subscriptions**: Allow users to subscribe to specific event types
- **Batch Updates**: Batch multiple updates into single events
- **Caching Strategy**: Implement more sophisticated caching strategies

## 📝 Usage Examples

### For Developers
```typescript
// Listen for vote cast events
useEffect(() => {
  const handleVoteCast = (data) => {
    console.log('Vote cast:', data);
    // Update UI accordingly
  };
  
  onVoteCast(handleVoteCast);
  return () => offVoteCast(handleVoteCast);
}, []);
```

### For Users
1. **Vote Submission**: Submit votes and see instant confirmation
2. **Live Updates**: Watch as other members vote in real-time
3. **Notifications**: Receive instant notifications for all club activities
4. **Seamless Experience**: Never need to refresh the page for updates

## 🔧 Troubleshooting

### Common Issues
- **Connection Problems**: Check network connectivity and API URL
- **Missing Notifications**: Verify user is member of the club
- **UI Not Updating**: Check browser console for errors
- **Performance Issues**: Monitor network tab for excessive requests

### Debug Information
- **Console Logs**: Detailed logging for all real-time events
- **Connection Status**: Admin can see connection status in navigation
- **Event History**: Browser dev tools show all socket events
- **Error Messages**: Clear error messages for common issues
