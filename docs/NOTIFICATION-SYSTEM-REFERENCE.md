# Notification System Reference

This document provides a comprehensive overview of all notification types in the Consensus application, what triggers them, and which UI components they refresh.

## Overview

The notification system uses a combination of:
- **Socket.IO** for real-time events
- **Database notifications** for persistent notifications
- **Component-specific handlers** for targeted UI updates

## Notification Types

### 1. Vote Cast (`vote_cast`)

**Triggered when:** A member casts a vote on a recommendation

**Backend Location:** `apps/consensus-api/src/controllers/voteController.ts`

**Socket Event Data:**
```typescript
{
  clubId: string;
  roundId: string;
  memberId: string;
  memberName: string;
  recommendationId: string;
  points: number;
}
```

**UI Components Refreshed:**
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Updates vote counts on recommendations
  - Refreshes voting progress
- Voting page (`/clubs/[id]/rounds/[roundId]/voting`)
  - Updates vote display
  - Shows current voting status

**Notification Handler:** `useNotificationHandler` with `vote_cast` type

---

### 2. Voting Started (`VOTING_STARTED`)

**Triggered when:** Round status changes to "voting"

**Backend Location:** `apps/consensus-api/src/controllers/roundController.ts` - `updateRoundStatus`

**Database Notification:**
```typescript
{
  type: 'VOTING_STARTED',
  title: 'Voting Started',
  message: 'Voting has started for this round',
  clubId: string,
  roundId: string
}
```

**UI Components Refreshed:**
- Club page (`/clubs/[id]`)
  - Updates round status display
  - Changes "Start Voting" button to "Vote Now"
  - Refreshes current round information
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Shows "Vote on Recommendations" button
  - Updates round status indicator
  - Refreshes recommendations and votes

**Notification Handler:** `useNotificationHandler` with `notification_created` type, filtering for `VOTING_STARTED`

---

### 3. Voting Completed (`VOTING_COMPLETED`)

**Triggered when:** Round status changes to "completing"

**Backend Location:** `apps/consensus-api/src/controllers/roundController.ts` - `updateRoundStatus`

**Database Notification:**
```typescript
{
  type: 'VOTING_COMPLETED',
  title: 'Voting Closed',
  message: 'Voting has been closed for this round',
  clubId: string,
  roundId: string
}
```

**UI Components Refreshed:**
- Club page (`/clubs/[id]`)
  - Updates round status to "completing"
  - Shows completion tracking options
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Hides voting buttons
  - Shows completion tracking section
  - Displays winning recommendation

**Notification Handler:** `useNotificationHandler` with `notification_created` type, filtering for `VOTING_COMPLETED`

---

### 4. Completion Updated (`completion_updated`)

**Triggered when:** A member marks a recommendation as complete or incomplete

**Backend Location:** `apps/consensus-api/src/controllers/completionController.ts` - `markCompletion`

**Socket Event Data:**
```typescript
{
  clubId: string;
  roundId: string;
  memberId: string;
  memberName: string;
  completed: boolean;
}
```

**UI Components Refreshed:**
- Completion tracking page (`/clubs/[id]/rounds/[roundId]/completion`)
  - Updates progress bar
  - Refreshes member completion status
  - Updates completion counts
  - Shows/hides completion checkmarks

**Notification Handler:** `useNotificationHandler` with `completion_updated` type (targeted refresh only)

---

### 5. Round Started (`ROUND_STARTED`)

**Triggered when:** A new round is created

**Backend Location:** `apps/consensus-api/src/controllers/roundController.ts` - `startNewRound`

**Database Notification:**
```typescript
{
  type: 'ROUND_STARTED',
  title: 'New Round Started',
  message: 'A new round has started with [recommender] as the recommender',
  clubId: string,
  roundId: string
}
```

**UI Components Refreshed:**
- Club page (`/clubs/[id]`)
  - Shows new round in current round section
  - Updates round count
  - Refreshes round list
- Round details page (if viewing the new round)
  - Shows new round information
  - Displays current recommender

**Notification Handler:** `useNotificationHandler` with `notification_created` type, filtering for `ROUND_STARTED`

---

### 6. Round Completed (`ROUND_COMPLETED`)

**Triggered when:** Round status changes to "finished"

**Backend Location:** `apps/consensus-api/src/controllers/roundController.ts` - `updateRoundStatus`

**Database Notification:**
```typescript
{
  type: 'ROUND_COMPLETED',
  title: 'Round Finished',
  message: 'The round has been completed',
  clubId: string,
  roundId: string
}
```

**UI Components Refreshed:**
- Club page (`/clubs/[id]`)
  - Moves round to completed rounds section
  - Updates completed round count
  - Shows new current round (if any)
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Shows final results
  - Displays completion summary

**Notification Handler:** `useNotificationHandler` with `notification_created` type, filtering for `ROUND_COMPLETED`

---

### 7. Recommendation Added (`recommendation_added`)

**Triggered when:** A member adds a recommendation to a round

**Backend Location:** `apps/consensus-api/src/controllers/recommendationController.ts`

**Socket Event Data:**
```typescript
{
  clubId: string;
  roundId: string;
  recommendationId: string;
  title: string;
  description: string;
  recommenderId: string;
  recommenderName: string;
}
```

**UI Components Refreshed:**
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Adds new recommendation to the list
  - Updates recommendation count
  - Refreshes recommendations display
- Club page (`/clubs/[id]`)
  - Updates recommendation count in stats

**Notification Handler:** `useNotificationHandler` with `recommendation_added` type

---

### 8. Member Added (`member_added`)

**Triggered when:** A new member is added to a club

**Backend Location:** `apps/consensus-api/src/controllers/memberController.ts`

**Socket Event Data:**
```typescript
{
  clubId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  role: 'member' | 'manager';
}
```

**UI Components Refreshed:**
- Club members page (`/clubs/[id]/members`)
  - Adds new member to the list
  - Updates member count
  - Refreshes member list
- Club page (`/clubs/[id]`)
  - Updates member count in stats

**Notification Handler:** `useNotificationHandler` with `member_added` type

---

### 9. Member Removed (`member_removed`)

**Triggered when:** A member is removed from a club

**Backend Location:** `apps/consensus-api/src/controllers/memberController.ts`

**Socket Event Data:**
```typescript
{
  clubId: string;
  memberId: string;
  memberName: string;
}
```

**UI Components Refreshed:**
- Club members page (`/clubs/[id]/members`)
  - Removes member from the list
  - Updates member count
  - Refreshes member list
- Club page (`/clubs/[id]`)
  - Updates member count in stats

**Notification Handler:** `useNotificationHandler` with `member_removed` type

---

### 10. Member Role Changed (`member_role_changed`)

**Triggered when:** A member's role is changed (member ↔ manager)

**Backend Location:** `apps/consensus-api/src/controllers/memberController.ts`

**Socket Event Data:**
```typescript
{
  clubId: string;
  memberId: string;
  memberName: string;
  oldRole: 'member' | 'manager';
  newRole: 'member' | 'manager';
}
```

**UI Components Refreshed:**
- Club members page (`/clubs/[id]/members`)
  - Updates member role display
  - Refreshes member list
  - Updates role indicators

**Notification Handler:** `useNotificationHandler` with `member_role_changed` type

---

### 11. Turn Changed (`turn_changed`)

**Triggered when:** A new round starts (new recommender)

**Backend Location:** `apps/consensus-api/src/controllers/roundController.ts` - `startNewRound`

**Socket Event Data:**
```typescript
{
  clubId: string;
  roundId: string;
  newRecommenderId: string;
  newRecommenderName: string;
  previousRecommenderId?: string;
  previousRecommenderName?: string;
}
```

**UI Components Refreshed:**
- Club page (`/clubs/[id]`)
  - Updates current recommender display
  - Refreshes round information
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Shows new recommender
  - Updates round status

**Notification Handler:** `useNotificationHandler` with `turn_changed` type

---

### 12. Round Status Changed (`round_status_changed`)

**Triggered when:** Round status changes (recommending → voting → completing → finished)

**Backend Location:** `apps/consensus-api/src/controllers/roundController.ts` - `updateRoundStatus`

**Socket Event Data:**
```typescript
{
  clubId: string;
  roundId: string;
  status: 'active' | 'voting' | 'completed';
  winnerId?: string;
  winnerTitle?: string;
}
```

**UI Components Refreshed:**
- Club page (`/clubs/[id]`)
  - Updates round status display
  - Changes available actions
  - Refreshes round information
- Round details page (`/clubs/[id]/rounds/[roundId]`)
  - Updates status indicators
  - Shows/hides relevant buttons
  - Refreshes round data

**Notification Handler:** `useNotificationHandler` with `round_status_changed` type

---

## Implementation Details

### Component-Specific Handlers

Each component can register for specific notification types:

```typescript
useNotificationHandler({
  component: 'ComponentName',
  notificationTypes: ['vote_cast', 'round_status_changed'],
  handler: (event) => {
    // Only refresh relevant data
    if (event.data.roundId === currentRoundId) {
      mutateRelevantData();
    }
  },
  priority: 10
});
```

### Socket Connection

Components that need real-time updates must connect to the socket:

```typescript
const { isConnected, joinClubs } = useSocket();

React.useEffect(() => {
  if (isConnected && clubId) {
    joinClubs([clubId]);
  }
}, [isConnected, clubId, joinClubs]);
```

### Performance Benefits

- **Targeted Updates:** Only relevant components refresh
- **Reduced API Calls:** Components only fetch data they need
- **Better UX:** Real-time updates without full page refreshes
- **Efficient:** Prevents unnecessary re-renders

## Testing Notifications

To test notifications, you can:

1. **Use the browser console** to see notification events
2. **Check the Network tab** for API calls
3. **Use the NotificationHandlerExample component** for testing
4. **Monitor socket events** in the browser dev tools

## Troubleshooting

If notifications aren't working:

1. Check if the component has socket connection
2. Verify the notification handler is registered
3. Check browser console for event logs
4. Ensure the backend is emitting events correctly
5. Verify the notification type matches exactly
