import { FastifyInstance } from "fastify";
import {
  createTicketHandler,
  deleteTicketHandler,
} from "../controllers/ticketController";
import { authenticate } from "../middleware/auth";
import {
  listUserTicketsHandler,
  getUserTicketHandler,
} from "../controllers/ticketController";

export async function ticketRoutes(fastify: FastifyInstance) {
  fastify.post("/tickets", { preHandler: [authenticate] }, createTicketHandler);
  fastify.get(
    "/tickets",
    { preHandler: [authenticate] },
    listUserTicketsHandler
  );
  fastify.get(
    "/tickets/:id",
    { preHandler: [authenticate] },
    getUserTicketHandler
  );
  fastify.delete(
    "/tickets/:id",
    { preHandler: [authenticate] },
    deleteTicketHandler
  );
}
