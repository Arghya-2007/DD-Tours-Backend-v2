import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: { // ✅ Singular
        url: process.env.DATABASE_URL,
    },
});