# CareMind Web Deployment

CareMind frontend is configured for static web export with Expo Router.

## Build

```bash
cd frontend
npm install
EXPO_PUBLIC_API_URL=https://your-backend-domain/api npm run build:web
```

## Output

The static site is generated in `frontend/dist` and can be deployed to:
- Render Static Site
- Netlify
- Vercel
- GitHub Pages with a custom workflow

## Required Environment Variable

- `EXPO_PUBLIC_API_URL=https://your-backend-domain/api`

## Notes

Free hosting is easiest when the backend is deployed separately on Render and the frontend is hosted as a static site.