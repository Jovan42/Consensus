# Auth0 Integration Setup Guide

This guide will help you set up Auth0 authentication with Google OAuth and hardcoded test accounts for the Consensus application.

## Prerequisites

1. An Auth0 account (free tier available)
2. A Google Cloud Console project (for Google OAuth)

## Step 1: Auth0 Configuration

### 1.1 Create Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Go to **Applications** → **Applications**
3. Click **Create Application**
4. Choose **Regular Web Applications**
5. Name it "Consensus App"

### 1.2 Configure Application Settings

In your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback,https://your-domain.com/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000,https://your-domain.com
```

**Allowed Web Origins:**
```
http://localhost:3000,https://your-domain.com
```

### 1.3 Get Auth0 Credentials

From your Auth0 application settings, copy:
- **Domain** (e.g., `your-domain.auth0.com`)
- **Client ID**
- **Client Secret**

## Step 2: Google OAuth Setup

### 2.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API**

### 2.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   https://your-domain.auth0.com/login/callback
   ```
5. Copy the **Client ID** and **Client Secret**

### 2.3 Configure Auth0 Social Connection

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Click **+ Create Connection**
3. Choose **Google**
4. Enter your Google OAuth credentials
5. Enable the connection

## Step 3: Environment Variables

Create a `.env.local` file in `apps/consensus-web/`:

```bash
# Auth0 Configuration
AUTH0_SECRET=your-32-character-secret-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Important:** Generate a secure secret for `AUTH0_SECRET`:
```bash
openssl rand -hex 32
```

## Step 4: Test Accounts

The application includes 4 hardcoded test accounts for development:

| Email | Name | Role | Description |
|-------|------|------|-------------|
| `test1@consensus.dev` | Test User 1 | admin | Admin test account |
| `test2@consensus.dev` | Test User 2 | member | Regular member |
| `test3@consensus.dev` | Test User 3 | member | Regular member |
| `admin@consensus.dev` | Admin User | admin | Admin account |

### Using Test Accounts

1. **Via Login Form**: Enter any test email in the custom test email field
2. **Via API**: POST to `/api/auth/test-login` with `{"email": "test1@consensus.dev"}`
3. **Direct Access**: Test accounts bypass Auth0 and work without internet

## Step 5: Role-Based Access Control

The system supports two roles:

- **admin**: Full access to all features
- **member**: Standard user access

### Protecting Routes

```tsx
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

// Require authentication
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="admin">
  <AdminComponent />
</ProtectedRoute>

// Require any of multiple roles
<ProtectedRoute requiredRole={['admin', 'moderator']}>
  <ModeratorComponent />
</ProtectedRoute>
```

### Using Auth Context

```tsx
import { useAuth } from '@/app/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  
  if (hasRole('admin')) {
    // Admin-only content
  }
  
  return (
    <div>
      Welcome, {user?.name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Step 6: Testing the Setup

### 6.1 Start the Application

```bash
cd apps/consensus-web
npm run dev
```

### 6.2 Test Authentication Flow

1. **Visit** `http://localhost:3000`
2. **Test Auth0 Login**: Click "Sign in with Auth0" → Google OAuth
3. **Test Account Login**: Use any test email in the custom field
4. **Verify Dashboard**: Should redirect to `/dashboard` after login
5. **Test Logout**: Click user profile → Sign Out

### 6.3 Test Role-Based Access

1. **Login as admin**: Use `admin@consensus.dev` or `test1@consensus.dev`
2. **Verify admin features**: Should see admin navigation items
3. **Login as member**: Use `test2@consensus.dev` or `test3@consensus.dev`
4. **Verify member access**: Should not see admin features

## Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, update your environment variables:

```bash
AUTH0_BASE_URL=https://your-domain.com
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### 7.2 Update Auth0 Settings

In your Auth0 application settings, update:
- **Allowed Callback URLs**: Add your production domain
- **Allowed Logout URLs**: Add your production domain
- **Allowed Web Origins**: Add your production domain

### 7.3 Update Google OAuth

In Google Cloud Console, add your production domain to authorized redirect URIs.

## Troubleshooting

### Common Issues

1. **"Invalid callback URL"**: Check Auth0 callback URLs match your domain
2. **"Google OAuth error"**: Verify Google OAuth credentials and redirect URIs
3. **"Test accounts not working"**: Ensure you're using the exact test email addresses
4. **"Session not persisting"**: Check AUTH0_SECRET is set and consistent

### Debug Mode

Enable debug logging by adding to your environment:

```bash
AUTH0_DEBUG=true
```

### Test Account Backdoor

If you need to add more test accounts, edit `apps/consensus-web/lib/auth0.ts`:

```typescript
const TEST_ACCOUNTS = {
  'your-test@email.com': {
    sub: 'your-test-id',
    email: 'your-test@email.com',
    name: 'Your Test User',
    picture: 'https://via.placeholder.com/150',
    role: 'member' // or 'admin'
  },
  // ... existing accounts
};
```

## Security Considerations

1. **Never commit** `.env.local` to version control
2. **Use strong secrets** for AUTH0_SECRET (32+ characters)
3. **Limit test accounts** to development environments
4. **Regularly rotate** Auth0 secrets in production
5. **Monitor** Auth0 logs for suspicious activity

## Next Steps

1. **Customize user profiles** with additional fields
2. **Implement user preferences** and settings
3. **Add more OAuth providers** (GitHub, LinkedIn, etc.)
4. **Set up user management** for admins
5. **Implement email verification** for new users
