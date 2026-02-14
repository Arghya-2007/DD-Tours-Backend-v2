// This file is used by the Prisma CLI (migrations, generate)
export default {
    datasource: {
        // We prefer DIRECT_URL for migrations (Port 5432)
        // If not found, fall back to DATABASE_URL
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
};