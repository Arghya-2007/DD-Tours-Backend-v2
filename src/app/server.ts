import app from './app';
import dotenv from 'dotenv';
import "../common/queue/notification.worker";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        // TODO: Connect to Database (Neon) here later
        // await db.connect();
        // console.log('✅ Database connected successfully');

        app.listen(PORT, () => {
            console.log(`✅ Server is listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

bootstrap();
