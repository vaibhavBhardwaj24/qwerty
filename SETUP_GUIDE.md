# Real-Time Collaborative Editing Setup Guide

This guide will help you set up and run the real-time collaborative editing system for your Notion-like app.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Redis server installed and running

## Step 1: Install Redis

If you don't have Redis installed:

**Windows (using Chocolatey):**

```bash
choco install redis-64
redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux:**

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

## Step 2: Install Dependencies

### Main Next.js App

```bash
npm install
```

### WebSocket Server

```bash
cd qwerty-WS
npm install
```

## Step 3: Configure Environment Variables

### Main App (.env)

Add these to your existing `.env` file:

```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1234
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
BULLMQ_REDIS_URL=redis://localhost:6379
```

### WebSocket Server (qwerty-WS/.env)

Create `.env` file in `qwerty-WS` directory:

```env
PORT=1234
NODE_ENV=development

REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

DATABASE_URL=<copy-from-main-app-env>

CLERK_SECRET_KEY=<copy-from-main-app-env>
WEBSOCKET_SECRET=<generate-random-string>

BULLMQ_REDIS_URL=redis://localhost:6379

SNAPSHOT_INTERVAL_MS=300000
```

## Step 4: Run Database Migrations

From the main app directory:

```bash
npx prisma generate
npx prisma migrate dev --name add_collaborative_editing
```

## Step 5: Start Services

You'll need **4 terminal windows**:

### Terminal 1: Redis

```bash
redis-server
```

### Terminal 2: WebSocket Server

```bash
cd qwerty-WS
npm run dev
```

### Terminal 3: Snapshot Worker

```bash
cd qwerty-WS
npm run worker:dev
```

### Terminal 4: Next.js App

```bash
npm run dev
```

## Step 6: Test Collaborative Editing

1. Open your browser to `http://localhost:3000`
2. Navigate to a page
3. Open the same page in a new browser window (or incognito mode)
4. Start typing in one window
5. You should see the changes appear in real-time in the other window
6. You should see user presence indicators at the top

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │
│  (Port 3000)    │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐      ┌──────────┐
│  Hocuspocus WS  │◄────►│  Redis   │
│  (Port 1234)    │      │ (Live)   │
└────────┬────────┘      └──────────┘
         │ BullMQ
         ▼
┌─────────────────┐      ┌──────────┐
│ Snapshot Worker │─────►│PostgreSQL│
│  (Background)   │      │(Storage) │
└─────────────────┘      └──────────┘
```

## How It Works

1. **Real-time Editing**: Users connect to the WebSocket server via Yjs
2. **Live Persistence**: Yjs documents are stored in Redis for fast access
3. **Periodic Snapshots**: Every 5 minutes (configurable), a snapshot job is queued
4. **Final Snapshot**: When the last user disconnects, a final snapshot is created
5. **Database Sync**: The snapshot worker processes jobs and syncs to PostgreSQL

## Troubleshooting

### WebSocket Connection Failed

- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Check WebSocket server is running on port 1234
- Verify `NEXT_PUBLIC_WEBSOCKET_URL` in `.env`

### Snapshots Not Creating

- Check snapshot worker is running
- View worker logs for errors
- Verify BullMQ can connect to Redis

### Database Sync Issues

- Ensure `DATABASE_URL` is correct in qwerty-WS/.env
- Run `npx prisma generate` in both directories
- Check Prisma client is up to date

## Production Deployment

For production:

1. **Build WebSocket Server:**

   ```bash
   cd qwerty-WS
   npm run build
   npm start
   ```

2. **Run Worker as Service:**
   Use PM2 or similar process manager:

   ```bash
   pm2 start npm --name "snapshot-worker" -- run worker
   ```

3. **Environment Variables:**
   - Update `NEXT_PUBLIC_WEBSOCKET_URL` to your production WebSocket URL
   - Use secure Redis connection (TLS)
   - Set `NODE_ENV=production`

## Monitoring

Monitor these metrics:

- Active WebSocket connections
- Redis memory usage
- BullMQ job queue length
- Snapshot processing time

## Next Steps

- Add more TipTap extensions (images, tables, etc.)
- Implement block-level permissions
- Add conflict resolution UI
- Implement offline support
- Add analytics for collaboration metrics
