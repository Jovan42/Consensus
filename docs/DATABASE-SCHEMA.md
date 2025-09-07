# Database Schema Documentation

This document provides a comprehensive overview of the Consensus application database schema, including all tables, columns, relationships, and constraints.

## Overview

The Consensus application uses PostgreSQL as its database and follows a relational model to support the consensus decision-making workflow. The database consists of 6 main tables that handle clubs, members, rounds, recommendations, voting, and completion tracking.

## Tables

### 1. `clubs`

Stores information about book clubs, movie clubs, gaming clubs, and other group activities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `name` | `character varying` | NO | NULL | Club name |
| `type` | `clubs_type_enum` | NO | `'book'` | Club type (book, movie, game, etc.) |
| `config` | `jsonb` | NO | NULL | Club configuration settings |
| `description` | `text` | YES | NULL | Optional club description |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

**Enum Values for `type`:**
- `book` - Book clubs
- `movie` - Movie clubs  
- `game` - Gaming clubs
- Other custom types as needed

**Configuration (`config` JSONB):**
```json
{
  "maxRecommendations": 3,
  "minRecommendations": 1,
  "votingPoints": [3, 2, 1],
  "minimumParticipation": 100,
  "tieBreakingMethod": "random"
}
```

### 2. `members`

Stores club membership information and user roles within clubs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `name` | `character varying` | NO | NULL | Member's display name |
| `email` | `character varying` | YES | NULL | Member's email address |
| `clubId` | `uuid` | NO | NULL | Foreign key to `clubs.id` |
| `isClubManager` | `boolean` | NO | `false` | Whether member is a club manager |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

**Roles:**
- **Regular Member**: `isClubManager = false`
- **Club Manager**: `isClubManager = true` (can manage club settings, promote members, add recommendations/votes for others)

### 3. `rounds`

Stores information about consensus rounds within clubs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `clubId` | `uuid` | NO | NULL | Foreign key to `clubs.id` |
| `currentRecommenderId` | `uuid` | NO | NULL | Foreign key to `members.id` (current recommender) |
| `status` | `rounds_status_enum` | NO | `'recommending'` | Current round status |
| `winningRecommendationId` | `uuid` | YES | NULL | Foreign key to `recommendations.id` (winner) |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

**Enum Values for `status`:**
- `recommending` - Members are adding recommendations
- `voting` - Members are voting on recommendations
- `completing` - Members are completing the winning recommendation

### 4. `recommendations`

Stores recommendations submitted by members during the recommending phase.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `title` | `character varying` | NO | NULL | Recommendation title |
| `description` | `character varying` | YES | NULL | Optional description |
| `roundId` | `uuid` | NO | NULL | Foreign key to `rounds.id` |
| `recommenderId` | `uuid` | NO | NULL | Foreign key to `members.id` (who recommended) |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

### 5. `votes`

Stores voting data when members vote on recommendations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `points` | `integer` | NO | NULL | Points assigned to recommendation |
| `memberId` | `uuid` | NO | NULL | Foreign key to `members.id` (voter) |
| `recommendationId` | `uuid` | NO | NULL | Foreign key to `recommendations.id` |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

**Voting System:**
- Each member votes on all recommendations in a round
- Points are assigned based on club configuration (e.g., [3, 2, 1])
- No duplicate points allowed per member
- No duplicate recommendations per member

### 6. `completions`

Tracks completion status of winning recommendations by members.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `memberId` | `uuid` | NO | NULL | Foreign key to `members.id` |
| `recommendationId` | `uuid` | NO | NULL | Foreign key to `recommendations.id` |
| `isCompleted` | `boolean` | NO | `false` | Completion status |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

### 7. `member_notes`

Stores private notes that members can keep for each round. Notes are only visible to the member who created them.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `content` | `text` | YES | NULL | Note content |
| `title` | `character varying(255)` | YES | NULL | Optional note title |
| `member_id` | `uuid` | NO | NULL | Foreign key to `members.id` |
| `round_id` | `uuid` | NO | NULL | Foreign key to `rounds.id` |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

**Indexes:**
- `IDX_member_notes_member_id` - Index on `member_id` for performance
- `IDX_member_notes_round_id` - Index on `round_id` for performance  
- `IDX_member_notes_member_round_unique` - Unique constraint on `(member_id, round_id)` to ensure one note per member per round

### 8. `notifications`

Stores notifications for club activities and member actions. Notifications are created for all club members when certain events occur.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | Primary key, unique identifier |
| `type` | `notification_type_enum` | NO | NULL | Type of notification |
| `status` | `notification_status_enum` | NO | `'unread'` | Read status of notification |
| `title` | `character varying` | NO | NULL | Notification title |
| `message` | `text` | NO | NULL | Notification message |
| `data` | `jsonb` | YES | NULL | Additional notification data |
| `memberId` | `uuid` | NO | NULL | Foreign key to `members.id` (recipient) |
| `clubId` | `uuid` | NO | NULL | Foreign key to `clubs.id` |
| `roundId` | `uuid` | YES | NULL | Foreign key to `rounds.id` (if applicable) |
| `createdAt` | `timestamp` | NO | `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NO | `now()` | Last update timestamp |

**Enum Values for `type`:**
- `vote_cast` - When a member submits their vote
- `voting_completed` - When voting is closed and a winner is determined
- `recommendation_added` - When new recommendations are added to a round
- `round_started` - When a new round begins
- `round_completed` - When a round is completed
- `member_added` - When a new member joins the club
- `member_removed` - When a member leaves the club
- `member_role_changed` - When a member's role changes
- `club_updated` - When club settings are updated

**Enum Values for `status`:**
- `unread` - Notification has not been read
- `read` - Notification has been read

**Indexes:**
- `IDX_notifications_member_id` - Index on `memberId` for performance
- `IDX_notifications_club_id` - Index on `clubId` for performance
- `IDX_notifications_round_id` - Index on `roundId` for performance
- `IDX_notifications_status` - Index on `status` for performance
- `IDX_notifications_created_at` - Index on `createdAt` for sorting
- `IDX_notifications_member_status` - Composite index on `(memberId, status)` for efficient unread queries

## Relationships

### Foreign Key Relationships

| Table | Column | References Table | References Column | Description |
|-------|--------|------------------|-------------------|-------------|
| `members` | `clubId` | `clubs` | `id` | Member belongs to a club |
| `rounds` | `clubId` | `clubs` | `id` | Round belongs to a club |
| `rounds` | `currentRecommenderId` | `members` | `id` | Current recommender for the round |
| `rounds` | `winningRecommendationId` | `recommendations` | `id` | Winning recommendation |
| `recommendations` | `roundId` | `rounds` | `id` | Recommendation belongs to a round |
| `recommendations` | `recommenderId` | `members` | `id` | Who made the recommendation |
| `votes` | `memberId` | `members` | `id` | Who cast the vote |
| `votes` | `recommendationId` | `recommendations` | `id` | What was voted on |
| `completions` | `memberId` | `members` | `id` | Who completed the recommendation |
| `completions` | `recommendationId` | `recommendations` | `id` | What was completed |
| `member_notes` | `member_id` | `members` | `id` | Note belongs to a member |
| `member_notes` | `round_id` | `rounds` | `id` | Note belongs to a round |
| `notifications` | `memberId` | `members` | `id` | Notification recipient |
| `notifications` | `clubId` | `clubs` | `id` | Notification belongs to a club |
| `notifications` | `roundId` | `rounds` | `id` | Notification related to a round (optional) |

## Indexes

All tables have primary key indexes on their `id` columns:

- `clubs`: `PK_bb09bd0c8d5238aeaa8f86ee0d4`
- `members`: `PK_28b53062261b996d9c99fa12404`
- `rounds`: `PK_9d254884a20817016e2f877c7e7`
- `recommendations`: `PK_23a8d2db26db8cabb6ae9d6cd87`
- `votes`: `PK_f3d9fd4a0af865152c3f59db8ff`
- `completions`: `PK_5beec6fc7e1d963597132268ef2`
- `member_notes`: `PK_member_notes`
- `notifications`: `PK_notifications`

## Workflow

### 1. Club Creation
1. Create a `club` record
2. Add the creator as a `member` with `isClubManager = true`

### 2. Round Lifecycle
1. **Start Round**: Create a `round` with status `recommending`
2. **Recommendations**: Members add `recommendations` to the round
3. **Voting**: Change round status to `voting`, members cast `votes`
4. **Completion**: Change round status to `completing`, track `completions`

### 3. Permissions
- **Regular Members**: Can only add recommendations/votes for themselves
- **Club Managers**: Can add recommendations/votes for any member in their club
- **Site Admins**: Can perform any action across all clubs

## Data Types

### UUIDs
All primary keys use UUIDs for better distributed system support and security.

### Enums
- `clubs_type_enum`: Defines valid club types
- `rounds_status_enum`: Defines valid round statuses

### JSONB
The `clubs.config` field uses JSONB for flexible configuration storage with good query performance.

### Timestamps
All tables include `createdAt` and `updatedAt` timestamps for audit trails.

## Security Considerations

1. **Authentication**: All API requests require authentication headers
2. **Authorization**: Role-based access control (RBAC) with club-level permissions
3. **Data Validation**: Input validation on all endpoints
4. **Audit Trail**: Timestamps on all records for tracking changes

## Performance Considerations

1. **Indexes**: Primary key indexes on all tables
2. **Foreign Keys**: Proper relationships for data integrity
3. **JSONB**: Efficient storage and querying of club configurations
4. **UUIDs**: Better performance in distributed systems

---

*Last updated: September 6, 2025*
*Database: PostgreSQL (Render.com)*
*ORM: TypeORM*
