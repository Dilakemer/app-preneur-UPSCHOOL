# CareMind Frontend Deployment

CareMind frontend is deployed as an Expo static web export.

## Build

```bash
cd frontend
npm ci
npm run build:web
```

## Environment

Set the backend URL before building:

```bash
EXPO_PUBLIC_API_URL=https://your-backend-domain/api
```

## Render

Use `frontend/render.yaml` for the static site configuration. The build publishes `frontend/dist`.
