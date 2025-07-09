import Fastify from "fastify";
import { prisma } from "./prisma";
import { authRoutes } from "./routes/authRoutes";

const fastify = Fastify({
  logger: true,
});

fastify.register(authRoutes);

fastify.get("/", async () => {
  return { message: "API is running!" };
});

// Start server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
