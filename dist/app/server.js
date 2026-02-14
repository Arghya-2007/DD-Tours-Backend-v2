"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
require("../common/queue/notification.worker");
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    try {
        // TODO: Connect to Database (Neon) here later
        // await db.connect();
        // console.log('✅ Database connected successfully');
        app_1.default.listen(PORT, () => {
            console.log(`✅ Server is listening on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map