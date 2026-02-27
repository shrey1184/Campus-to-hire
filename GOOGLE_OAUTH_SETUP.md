# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for Campus-to-Hire.

## Prerequisites

- A Google Account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Campus-to-Hire")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required information:
   - **App name**: Campus-to-Hire
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
8. Click "Update" then "Save and Continue"
9. Add test users (your email for testing)
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Fill in the details:
   - **Name**: Campus-to-Hire Web Client
   
   **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - Add your production URL when deploying
   
   **Authorized redirect URIs**:
   - `http://localhost:3000/auth/callback/google` (for local development)
   - Add your production callback URL when deploying
   
5. Click "Create"
6. **IMPORTANT**: Copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

### Backend (.env)

Add these to your `/backend/.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google
```

### Frontend (.env.local)

Add these to your `/frontend/.env.local` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 6: Install Dependencies

### Backend
```bash
cd backend
pip install authlib httpx
# or
pip install -r requirements.txt
```

### Frontend
Dependencies are already installed (next-auth is in package.json)

## Step 7: Run Database Migration

```bash
cd backend
alembic upgrade head
```

## Step 8: Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit `http://localhost:3000/login`
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected to the dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Console exactly matches: `http://localhost:3000/auth/callback/google`
- No trailing slash
- Exact protocol (http vs https)

### Error: "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Add yourself as a test user if the app is not published

### Error: "Invalid client"
- Double-check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Make sure there are no extra spaces or quotes

### Backend OAuth not configured
- Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in backend/.env
- Restart the backend server after adding env variables

## Production Deployment

When deploying to production:

1. Add your production domain to Google Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/auth/callback/google`

2. Update environment variables:
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback/google
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. Verify your app in Google Console if needed
4. Submit for verification if you need more than 100 users

## Security Notes

- Never commit `.env` or `.env.local` files to git
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your secrets
- Monitor OAuth usage in Google Console

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Authlib Documentation](https://docs.authlib.org/)
