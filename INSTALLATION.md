# Installation and Setup Script

Follow these steps to install dependencies and set up the collaborative editing system.

## Step 1: Install Main App Dependencies

```bash
npm install
```

This will install the new collaboration packages:

- `@tiptap/extension-collaboration`
- `@tiptap/extension-collaboration-cursor`
- `yjs`
- `y-websocket`
- `y-protocols`

## Step 2: Install WebSocket Server Dependencies

```bash
cd qwerty-WS
npm install
cd ..
```

This will install:

- `@hocuspocus/server`
- `@hocuspocus/extension-redis`
- `yjs`
- `bullmq`
- `ioredis`
- `@prisma/client`
- And dev dependencies

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This will generate the Prisma client with the new `YjsSnapshot` model and updated `Block` model.

## Step 4: Create Database Migration

```bash
npx prisma migrate dev --name add_collaborative_editing
```

This will:

- Create migration files for the schema changes
- Apply the migration to your database
- Add the `YjsSnapshot` table
- Add `lastSyncedAt` field to `Block` table

## Step 5: Copy Prisma Client to WebSocket Server

The WebSocket server needs access to the Prisma client:

```bash
cd qwerty-WS
npx prisma generate
cd ..
```

## Step 6: Configure Environment Variables

### Main App (.env)

Add these lines to your `.env` file:

```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1234
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
BULLMQ_REDIS_URL=redis://localhost:6379
```

### WebSocket Server (qwerty-WS/.env)

Create a `.env` file in the `qwerty-WS` directory:

```env
PORT=1234
NODE_ENV=development

REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Copy this from your main .env file
DATABASE_URL=postgresql://...

# Copy this from your main .env file
CLERK_SECRET_KEY=sk_...

WEBSOCKET_SECRET=your_random_secret_here

BULLMQ_REDIS_URL=redis://localhost:6379

SNAPSHOT_INTERVAL_MS=300000
```

## Step 7: Verify Redis is Running

Make sure Redis is installed and running:

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

If Redis is not running:

- **Windows**: `redis-server` (if installed via Chocolatey)
- **macOS**: `brew services start redis`
- **Linux**: `sudo systemctl start redis`

## Troubleshooting

### Module Not Found Errors

If you see errors like "Cannot find module '@hocuspocus/server'":

1. Make sure you ran `npm install` in both directories
2. Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Prisma Errors

If you see errors about `yjsSnapshot` or `lastSyncedAt`:

1. Make sure you ran `npx prisma generate` after updating the schema
2. Run `npx prisma migrate dev` to apply database changes
3. Restart your TypeScript server (in VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")

### Type Errors in WebSocket Server

The type errors in the WebSocket server files are expected until you install the dependencies. They will be resolved after running `npm install` in the `qwerty-WS` directory.

## Next: Start the Services

Once installation is complete, see [SETUP_GUIDE.md](file:///c:/Users/Vaibhav/Desktop/code/qwerty/SETUP_GUIDE.md) for instructions on starting all services.
