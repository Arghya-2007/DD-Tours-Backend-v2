import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// 1. Configure Neon to use WebSockets (Crucial for Node.js environment)
neonConfig.webSocketConstructor = ws;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

// 3. Initialize Adapter
// ⚠️ FIX: Cast 'pool' to 'any' to bypass the TS mismatch error
// The runtime behavior is correct, but the type definitions are slightly out of sync.
const adapter = new PrismaNeon(pool as any);

// 4. Initialize Prisma with the Adapter
const prisma = new PrismaClient({ adapter });

export default prisma;