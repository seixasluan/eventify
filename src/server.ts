import Fastify from "fastify";
import { authRoutes } from "./routes/authRoutes";
import { authenticate } from "./middleware/auth";
import { eventRoutes } from "./routes/eventRoutes";
import { ticketRoutes } from "./routes/ticketRoutes";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";

async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(multipart);

  // Serve static files for uploaded images
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "uploads"),
    prefix: "/uploads/",
  });

  // Register routes
  fastify.register(authRoutes);
  fastify.register(eventRoutes);
  fastify.register(ticketRoutes);

  // Health check
  fastify.get("/", async () => {
    return { message: "API is running!" };
  });

  // Protected test route
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

  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info(`Server listening on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();
