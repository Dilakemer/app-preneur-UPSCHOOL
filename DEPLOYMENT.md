# CareMind Production Checklist

## Backend

1. Set production environment variables on Render, Railway, Fly.io or your host:
   - `NODE_ENV=production`
   - `PORT=3001` or the platform-provided port
   - `GEMINI_API_KEY=...`
   - `GEMINI_MODEL=gemini-2.0-flash`
   - `GEMINI_FALLBACK_MODELS=gemini-2.5-flash`
   - `ADMIN_API_KEY=...`
   - `CORS_ORIGIN=https://your-web-domain.com`
   - `DB_PERSISTENCE=file`
   - `DB_FILE_PATH=/persistent/caremind-db.json`
2. Build command: `npm run build`
3. Start command: `node dist/index.js`
4. Health check path: `/api/saglik-kontrol`

## Web Frontend

The current web dashboard lives in the `web/` directory. On Render, deploy it as a **Static Site**, not as the Expo mobile frontend.

Recommended Render settings:

1. Root Directory: `web`
2. Build Command: `npm ci && npm run build`
3. Publish Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL=https://caremind-api.onrender.com/api`
5. Redirect/Rewrites:
   - Source: `/*`
   - Destination: `/index.html`

If Render logs show `npm run build:web` or `expo export --platform web`, Render is building the old Expo/mobile web target from `frontend/`. Change the service root directory to `web`, then run **Manual Deploy > Clear build cache & deploy**.

Alternative setup if Root Directory is left empty:

1. Build Command: `cd web && npm ci && npm run build`
2. Publish Directory: `web/dist`

## Mobile

1. Confirm `EXPO_PUBLIC_API_URL` in `frontend/eas.json` points to your production backend.
2. Install EAS CLI if needed: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure project once from `frontend`: `eas build:configure`
5. Internal Android APK: `eas build -p android --profile preview`
6. Store Android AAB: `eas build -p android --profile production`
7. iOS TestFlight/App Store: `eas build -p ios --profile production`

## Smoke Test

1. Open `/api/saglik-kontrol` and confirm `status` is `online`.
2. Register a local profile in the app.
3. Add a vehicle with at least one future date.
4. Open vehicle detail and ask the AI assistant a custom question.
5. Toggle notification permission and confirm scheduled reminders do not error.
