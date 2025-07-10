import { FastifyInstance } from "fastify";
import { createTicketHandler } from "../controllers/ticketController";
import { authenticate } from "../middleware/auth";

export async function ticketRoutes(server: FastifyInstance) {
  server.post("/tickets", { preHandler: [authenticate] }, createTicketHandler);
}
