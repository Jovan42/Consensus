# OAuth Signup Setup Guide

This guide will help you set up OAuth signup with Google for the Consensus application.

## Current Status

✅ **Test Accounts**: Fully functional with 4 hardcoded accounts  
🔄 **OAuth Integration**: Ready for configuration  
📋 **UI Components**: Complete login form with OAuth button  

## Quick Start (Test Accounts)

The application currently works with test accounts. You can sign in immediately using:

| Email | Name | Role | Description |
|-------|------|------|-------------|
| `test1@consensus.dev` | Test User 1 | admin | Admin test account |
| `test2@consensus.dev` | Test User 2 | member | Regular member |
| `test3@consensus.dev` | Test User 3 | member | Regular member |
| `admin@consensus.dev` | Admin User | admin | Admin account |

### How to Use Test Accounts:
1. Go to `http://localhost:3000`
2. Click any test account button, or
3. Enter `test1@consensus.dev` in the custom email field
4. You'll be logged in and redirected to the dashboard

## Setting Up OAuth with Google

### Step 1: Create Auth0 Account

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Sign up for a free account
3. Create a new tenant (e.g., `consensus-app`)

### Step 2: Create Auth0 Application

1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Name: `Consensus App`
4. Type: **Regular Web Applications**
5. Click **Create**

### Step 3: Configure Application Settings

In your Auth0 application settings, set:

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

### Step 4: Get Auth0 Credentials

From your Auth0 application settings, copy:
- **Domain** (e.g., `consensus-app.auth0.com`)
- **Client ID**
- **Client Secret**

### Step 5: Set Up Google OAuth

#### 5.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API**

#### 5.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `Consensus App`
5. Authorized redirect URIs:
   ```
   https://consensus-app.auth0.com/login/callback
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

#### 5.3 Configure Auth0 Social Connection

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Click **+ Create Connection**
3. Choose **Google**
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

### Step 6: Environment Variables

Create a `.env.local` file in `apps/consensus-web/`:

```bash
# Auth0 Configuration
AUTH0_SECRET=your-32-character-secret-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://consensus-app.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Generate AUTH0_SECRET:**
```bash
openssl rand -hex 32
```

### Step 7: Install Auth0 SDK (if needed)

The Auth0 SDK is already installed, but if you need to reinstall:

```bash
cd apps/consensus-web
npm install @auth0/nextjs-auth0
```

### Step 8: Create Auth0 API Routes

Create the file `apps/consensus-web/app/api/auth/[...auth0]/route.ts`:

```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

### Step 9: Test OAuth Signup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000`

3. Click **"Continue with Google"** button

4. You should be redirected to Google OAuth

5. After authentication, you'll be redirected back to the dashboard

## OAuth Signup Flow

### For New Users:
1. **Click "Continue with Google"** → Redirects to Google OAuth
2. **Sign in with Google** → Google authenticates the user
3. **Authorize the app** → User grants permissions
4. **Redirect to Auth0** → Auth0 processes the OAuth response
5. **Create user account** → Auth0 automatically creates user profile
6. **Redirect to app** → User is logged in and redirected to dashboard

### For Existing Users:
1. **Click "Continue with Google"** → Redirects to Google OAuth
2. **Sign in with Google** → Google authenticates the user
3. **Redirect to Auth0** → Auth0 recognizes existing user
4. **Redirect to app** → User is logged in and redirected to dashboard

## User Profile Management

### Automatic Profile Creation
- **Name**: From Google profile
- **Email**: From Google account
- **Picture**: Google profile picture
- **Role**: Defaults to 'member' (can be changed in Auth0)

### Role Assignment
You can assign roles in Auth0:

1. Go to **User Management** → **Users**
2. Click on a user
3. Go to **Roles** tab
4. Assign roles (admin, member, etc.)

## Troubleshooting

### Common Issues:

1. **"Invalid callback URL"**
   - Check Auth0 callback URLs match your domain
   - Ensure Google redirect URI matches Auth0 domain

2. **"Google OAuth error"**
   - Verify Google OAuth credentials
   - Check Google Cloud Console redirect URIs

3. **"Auth0 configuration error"**
   - Verify all environment variables are set
   - Check Auth0 application settings

4. **"User not created"**
   - Check Auth0 logs for errors
   - Verify Google OAuth permissions

### Debug Mode:
Add to your environment variables:
```bash
AUTH0_DEBUG=true
```

## Production Deployment

### Update Environment Variables:
```bash
AUTH0_BASE_URL=https://your-domain.com
AUTH0_ISSUER_BASE_URL=https://consensus-app.auth0.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Update Auth0 Settings:
- **Allowed Callback URLs**: Add your production domain
- **Allowed Logout URLs**: Add your production domain
- **Allowed Web Origins**: Add your production domain

### Update Google OAuth:
- Add production domain to authorized redirect URIs

## Security Considerations

1. **Never commit** `.env.local` to version control
2. **Use strong secrets** for AUTH0_SECRET (32+ characters)
3. **Regularly rotate** Auth0 secrets in production
4. **Monitor** Auth0 logs for suspicious activity
5. **Use HTTPS** in production

## Next Steps

1. **Set up Auth0 account** and configure Google OAuth
2. **Add environment variables** with your credentials
3. **Test OAuth flow** with Google signup
4. **Configure user roles** in Auth0 dashboard
5. **Deploy to production** with proper domain settings

The application is ready for OAuth signup - you just need to configure the Auth0 and Google OAuth credentials!
