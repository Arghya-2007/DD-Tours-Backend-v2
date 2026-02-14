import { config } from 'dotenv'; // 1. Import dotenv

config(); // 2. Load the .env file immediately

export default {
    datasource: {
        // Now process.env will actually have values!
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
};