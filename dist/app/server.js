"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 1. ABSOLUTE FIRST STEP: Load Environment Variables 🥇
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 2. NOW import the rest of your application
const app_1 = __importDefault(require("./app"));
require("../common/queue/notification.worker");
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    try {
        // Prisma handles its own connection on the first query.
        // As long as the environment variables are loaded (Step 1), it will work.
        app_1.default.listen(PORT, () => {
            console.log(`✅ Server is listening on port ${PORT}`);
            console.log(`🚀 Mode: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map