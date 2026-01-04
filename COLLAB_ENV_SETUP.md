# Collaborative Editing Environment Variables

Add these to your `.env` file:

```env
# WebSocket Server
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1234

# Redis (if not already present)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# BullMQ (if not already present)
BULLMQ_REDIS_URL=redis://localhost:6379
```

## WebSocket Server (.env in qwerty-WS directory)

```env
PORT=1234
NODE_ENV=development

REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

DATABASE_URL=<your-database-url>

CLERK_SECRET_KEY=<your-clerk-secret-key>
WEBSOCKET_SECRET=<random-secret>

BULLMQ_REDIS_URL=redis://localhost:6379

SNAPSHOT_INTERVAL_MS=300000
```
