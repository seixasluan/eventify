import Fastify from "fastify";
import { prisma } from "./prisma";
import { authRoutes } from "./routes/authRoutes";
import { authenticate } from "./middleware/auth";
import { eventRoutes } from "./routes/eventRoutes";

const fastify = Fastify({
  logger: true,
});

fastify.register(authRoutes);
fastify.register(eventRoutes);

fastify.get("/", async () => {
  return { message: "API is running!" };
});

// test protected route
fastify.get(
  "/protected",
  { preHandler: [authenticate] },
  async (request, reply) => {
    return {
      message: "Protected route accessed!",
      user: (request as any).user,
    };
  }
);

// Start server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
