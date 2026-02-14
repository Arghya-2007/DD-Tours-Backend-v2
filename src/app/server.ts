// 1. ABSOLUTE FIRST STEP: Load Environment Variables 🥇
import dotenv from 'dotenv';
dotenv.config();

// 2. NOW import the rest of your application
import app from './app';
import "../common/queue/notification.worker";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        // Prisma handles its own connection on the first query.
        // As long as the environment variables are loaded (Step 1), it will work.

        app.listen(PORT, () => {
            console.log(`✅ Server is listening on port ${PORT}`);
            console.log(`🚀 Mode: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

bootstrap();