import dotenv from 'dotenv';

// 1. CONFIG MUST BE FIRST! 🥇
// This ensures variables are loaded before any other file tries to read them.
dotenv.config();

import app from './app'; // 2. Now import the app
import "../common/queue/notification.worker";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        // Note: Prisma connects automatically when the first query is made,
        // so you don't strictly need a manual connect() call here.

        app.listen(PORT, () => {
            console.log(`✅ Server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

bootstrap();