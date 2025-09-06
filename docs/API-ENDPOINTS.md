# API Endpoints Documentation

This document contains all the API endpoints for the Consensus application.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://your-api-domain.com`

## Authentication
Currently, the MVP has no authentication. All endpoints are public.

## Health Check

### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-06T08:57:04.639Z"
}
```

## Clubs

### GET /api/clubs
Get all clubs.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Book Club",
    "type": "book",
    "config": {
      "minRecommendations": 3,
      "maxRecommendations": 5,
      "votingPoints": [3, 2, 1],
      "turnOrder": "sequential",
      "tieBreakingMethod": "random",
      "minimumParticipation": 80
    },
    "createdAt": "2025-09-06T08:57:04.639Z",
    "updatedAt": "2025-09-06T08:57:04.639Z"
  }
]
```

### POST /api/clubs
Create a new club.

**Request Body:**
```json
{
  "name": "My Book Club",
  "type": "book",
  "config": {
    "minRecommendations": 3,
    "maxRecommendations": 5,
    "votingPoints": [3, 2, 1],
    "turnOrder": "sequential",
    "tieBreakingMethod": "random",
    "minimumParticipation": 80
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Book Club",
  "type": "book",
  "config": { ... },
  "createdAt": "2025-09-06T08:57:04.639Z",
  "updatedAt": "2025-09-06T08:57:04.639Z"
}
```

### GET /api/clubs/:id
Get a specific club by ID.

### PUT /api/clubs/:id
Update a club.

### DELETE /api/clubs/:id
Delete a club.

## Members

### GET /api/clubs/:clubId/members
Get all members of a club.

### POST /api/clubs/:clubId/members
Add a new member to a club.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### PUT /api/members/:id
Update a member.

### DELETE /api/members/:id
Remove a member from a club.

## Rounds

### GET /api/clubs/:clubId/rounds
Get all rounds for a club.

### POST /api/clubs/:clubId/rounds
Start a new round.

**Request Body:**
```json
{
  "currentRecommenderId": "member-uuid"
}
```

### GET /api/rounds/:id
Get a specific round.

### PUT /api/rounds/:id/status
Update round status.

**Request Body:**
```json
{
  "status": "voting" // "recommending" | "voting" | "completing" | "finished"
}
```

## Recommendations

### GET /api/rounds/:roundId/recommendations
Get all recommendations for a round.

### POST /api/rounds/:roundId/recommendations
Add recommendations to a round.

**Request Body:**
```json
{
  "recommendations": [
    {
      "title": "The Great Gatsby",
      "description": "A classic American novel"
    },
    {
      "title": "1984",
      "description": "Dystopian fiction"
    }
  ]
}
```

### PUT /api/recommendations/:id
Update a recommendation.

### DELETE /api/recommendations/:id
Remove a recommendation.

## Voting

### GET /api/rounds/:roundId/votes
Get all votes for a round.

### POST /api/rounds/:roundId/votes
Submit votes for a round.

**Request Body:**
```json
{
  "votes": [
    {
      "recommendationId": "uuid",
      "points": 3
    },
    {
      "recommendationId": "uuid",
      "points": 2
    },
    {
      "recommendationId": "uuid",
      "points": 1
    }
  ]
}
```

### POST /api/rounds/:roundId/close-voting
Close voting and determine the winner.

## Completions

### GET /api/rounds/:roundId/completions
Get completion status for all members.

### POST /api/rounds/:roundId/completions
Mark completion for a member.

**Request Body:**
```json
{
  "memberId": "uuid",
  "isCompleted": true
}
```

### POST /api/rounds/:roundId/finish
Finish the round and start the next one.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
