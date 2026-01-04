# Quick Start Commands

Run these commands in order to set up collaborative editing:

```bash
# 1. Install main app dependencies
npm install

# 2. Install WebSocket server dependencies
cd qwerty-WS
npm install
cd ..

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migration
npx prisma migrate dev --name add_collaborative_editing

# 5. Generate Prisma client for WebSocket server
cd qwerty-WS
npx prisma generate
cd ..

# 6. Configure environment variables
# - Add NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1234 to main .env
# - Create qwerty-WS/.env with required variables (see INSTALLATION.md)

# 7. Start Redis (if not running)
redis-server

# 8. Start all services (in separate terminals):
# Terminal 1: Redis
redis-server

# Terminal 2: WebSocket Server
cd qwerty-WS
npm run dev

# Terminal 3: Snapshot Worker
cd qwerty-WS
npm run worker:dev

# Terminal 4: Next.js App
npm run dev
```

See [INSTALLATION.md](file:///c:/Users/Vaibhav/Desktop/code/qwerty/INSTALLATION.md) for detailed instructions and troubleshooting.
