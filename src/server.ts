import { createApp } from "./app";
import { ENV } from "./config/env";

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`🍜 [Phở Gia Truyền 1986] Backend Service is running on http://localhost:${ENV.PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${ENV.PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${ENV.PORT}/api/v1/auth`);
  console.log(`⭐ Loyalty API: http://localhost:${ENV.PORT}/api/v1/loyalty`);
  console.log(`🍜 Taste Profile API: http://localhost:${ENV.PORT}/api/v1/user/taste-profile`);
});

export default server;
