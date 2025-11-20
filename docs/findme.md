# FindMe Face Search

The `POST /api/findme/run` endpoint now persists Pixcheese albums after the
second time a share link is processed and reuses the cached face tokens for
subsequent searches. This keeps the first parse lightweight while ensuring
repeat requests have near-instant startup.

## Cache lifecycle

1. **First request** – Runs the legacy flow (Pixcheese download → compression →
   Face++ detection) and stores only the audit rows.
2. **Second request** – Uses the fresh run to capture:
   - `findme_search_album` rows per photo (with `metadata.faceTokens`)
   - One or more FaceSets plus their token ranges.
   The session is marked with `cache_status = 'ready'`.
3. **Later requests** – Look up the latest `cache_status = 'ready'` session for
   the same `share_key` and reuse its FaceSets and album metadata. No Pixcheese
   download or detection is required. If a cached FaceSet disappears, the server
   rebuilds it from the stored face tokens and updates the ready session.

Each new request still creates a `findme_search_session` record; reuses are
tagged with `cache_status = 'reuse'` and include the original cache session ID
inside metadata.

## FaceSet pagination

Large albums are split into multiple FaceSets. Tokens are chunked according to
`FINDME_FACESET_TOKEN_LIMIT` (default `4000`) and the FaceSets are created in
parallel. Searches run against every FaceSet and the results are merged so the
confidence/rank logic matches the previous behavior.

## Parallel detection

Photo compression still runs up-front, but calls to `client.detectByFile` now
use controlled concurrency via `FINDME_DETECT_CONCURRENCY` (default `4`) plus a
rate limiter (`FINDME_DETECT_REQUESTS_PER_SECOND`). Each detect call retries on
`CONCURRENCY_LIMIT_EXCEEDED` with backoff governed by
`FINDME_DETECT_MAX_RETRIES`/`FINDME_DETECT_RETRY_DELAY_MS`. `faceset/addface`
calls remain batched (5 tokens per request) but multiple FaceSets are created in
parallel.

## Configuration

Add the following optional variables to `.env.local` to tune behavior:

```env
# Maximum face tokens per FaceSet before a new one is created
FINDME_FACESET_TOKEN_LIMIT=4000

# Number of concurrent Face++ detection requests for album photos
FINDME_DETECT_CONCURRENCY=4

# Detect calls per second and retry controls
FINDME_DETECT_REQUESTS_PER_SECOND=4
FINDME_DETECT_MAX_RETRIES=3
FINDME_DETECT_RETRY_DELAY_MS=1000
```

`FACEPP_API_KEY`, `FACEPP_API_SECRET`, and the Pixcheese knobs (`FINDME_PIXCHEESE_*`)
should already be set for the FindMe feature to work end-to-end.
