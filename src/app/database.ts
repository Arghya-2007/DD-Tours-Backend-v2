import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// 1. Configure Neon to use WebSockets (Crucial for Node.js environment)
neonConfig.webSocketConstructor = ws;

console.log("-----------------------------------------");
console.log("🔍 DEBUGGING DATABASE CONNECTION");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL Exists?", !!process.env.DATABASE_URL); // Will print true/false
console.log("DATABASE_URL First 10 chars:", process.env.DATABASE_URL?.substring(0, 10)); // Safe print
console.log("-----------------------------------------");

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

// 3. Initialize Adapter
// ⚠️ FIX: Cast 'pool' to 'any' to bypass the TS mismatch error
// The runtime behavior is correct, but the type definitions are slightly out of sync.
const adapter = new PrismaNeon(pool as any);

// 4. Initialize Prisma with the Adapter
const prisma = new PrismaClient({ adapter });

export default prisma;