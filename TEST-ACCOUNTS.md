# Test Accounts (Development)

## Admin Users (3 admins)

| Email | Name | Role | Sub |
|-------|------|------|-----|
| alexander.thompson@consensus.dev | Alexander Thompson | admin | alex-admin |
| maya.patel@consensus.dev | Maya Patel | admin | maya-admin |
| james.rodriguez@consensus.dev | James Rodriguez | admin | james-admin |

## Regular Members (6 members)

| Email | Name | Role | Sub |
|-------|------|------|-----|
| sophia.chen@consensus.dev | Sophia Chen | member | sophia-member |
| michael.johnson@consensus.dev | Michael Johnson | member | michael-member |
| emma.williams@consensus.dev | Emma Williams | member | emma-member |
| oliver.brown@consensus.dev | Oliver Brown | member | oliver-member |
| ava.davis@consensus.dev | Ava Davis | member | ava-member |
| liam.miller@consensus.dev | Liam Miller | member | liam-member |

## Auth0 Test Account

| Email | Name | Role | Sub |
|-------|------|------|-----|
| user@gmail.com | Google User | member | google-user-123 |

## Usage

These test accounts are available for development and testing purposes. They are hardcoded in both the frontend (`apps/consensus-web/lib/auth0.ts`) and backend (`apps/consensus-api/src/middleware/auth.middleware.ts`) applications.

### Admin Capabilities
- Full access to all clubs
- Can manage any club (add members, change settings, etc.)
- Can vote for anyone in any club
- Can add recommendations for any round
- Can mark completion for anyone

### Member Capabilities
- Can only see clubs they are members of
- Can only vote for themselves (unless they are club managers)
- Can only add recommendations when it's their turn
- Can only mark themselves as complete

### Club Manager Role
Any member can be promoted to "Club Manager" status within a specific club, giving them admin-like powers for that club only.
