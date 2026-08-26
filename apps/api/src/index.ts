import "dotenv/config";
import { createApp } from "./app";

const PORT = process.env.PORT ?? 4000;

const app = createApp();

app.listen(PORT, () => {
    console.log(`🔧 Garage API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
});
