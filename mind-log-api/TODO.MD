1. Get a Google OAuth2 Client ID and Secret from https://console.cloud.google.com/ → APIs
   & Services → Credentials → OAuth 2.0 Client IDs
2. Set the Authorized redirect URI in Google Cloud Console to:
   http://localhost:8080/api/login/oauth2/code/google
3. Set the credentials in your environment (or .env):
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
4. Reset the database (since V001 was modified) and restart the backend.