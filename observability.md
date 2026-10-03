# Mobilex client observability

Set `VITE_OBSERVABILITY_ENDPOINT` to an HTTPS endpoint that accepts a JSON POST body:

```json
{ "app": "Mobilex", "version": "2.0.0", "environment": "production", "events": [] }
```

The client emits only application-safe fields, omits query strings from URLs, and caps the in-session queue at 40 events. Telemetry failures are intentionally swallowed so monitoring can never block checkout or navigation.
