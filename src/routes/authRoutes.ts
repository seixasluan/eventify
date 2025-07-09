import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler } from "../controllers/authController";

export async function authRoutes(fastify: FastifyInstance) {
  // POST
  fastify.post("/register", registerHandler);
  fastify.post("/login", loginHandler);
}
