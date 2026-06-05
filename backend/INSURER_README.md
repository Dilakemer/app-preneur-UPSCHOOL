Insurance integration notes

- Endpoint added: POST /api/sigorta/teklifler
  - Accepts a JSON vehicle object (must include `plaka` and `yil`). Returns an array of normalized offers: [{ id, name, price, raw }].

- Optional environment variables for external insurer APIs (one per provider):
  - ALLIANZ_API_URL, ALLIANZ_API_KEY
  - AKSIGORTA_API_URL, AKSIGORTA_API_KEY
  - ANADOLU_API_URL, ANADOLU_API_KEY

- If an insurer URL is configured, backend will call it with query params: `plaka, marka, model, yil` and expect JSON with at least `price` field. If the call fails or is not configured, a deterministic fallback price is returned.

- Cache:
  - Simple in-memory cache used to reduce outbound calls. Configure TTL with `INSURER_CACHE_TTL_SECONDS` (default 60).

- Production notes:
  - Deploy behind a secure API gateway. Store API keys in secret manager and set env vars.
  - Consider persistent caching (Redis) and rate-limiting per client.
  - Validate and sanitize external API responses in stricter schema for production.

To add a new insurer:
1. Add env vars INSURERNAME_API_URL and optionally INSURERNAME_API_KEY.
2. Add an entry in `backend/insurers.ts` INSURERS list with matching id and name.
3. Restart the backend.
