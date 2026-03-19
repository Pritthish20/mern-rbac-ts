import { app } from "./app";
import { connectDatabase, seedDefaultAdmin } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await connectDatabase();
  await seedDefaultAdmin();

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
    console.log(`Swagger docs available at http://localhost:${env.PORT}/api-docs`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap the server");
  console.error(error);
  process.exit(1);
});
