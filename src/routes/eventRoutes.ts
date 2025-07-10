import { FastifyInstance } from "fastify";
import {
  createEventHandler,
  getEventHandler,
  updateEventHandler,
  deleteEventHandler,
  listPublicEventsHandler,
  listOrganizerEventsHandler,
} from "../controllers/eventController";
import { authenticate } from "../middleware/auth";
import { authorizeOrganizer } from "../middleware/authorizeOrganizer";

export async function eventRoutes(fastify: FastifyInstance) {
  fastify.get("/events", listPublicEventsHandler);
  fastify.get(
    "/events/mine",
    { preHandler: [authenticate, authorizeOrganizer] },
    listOrganizerEventsHandler
  );
  fastify.get("/events/:id", { preHandler: [authenticate] }, getEventHandler);
  fastify.post(
    "/events",
    {
      preHandler: [authenticate, authorizeOrganizer],
    },
    createEventHandler
  );

  fastify.put(
    "/events/:id",
    {
      preHandler: [authenticate, authorizeOrganizer],
    },
    updateEventHandler
  );

  fastify.delete(
    "/events/:id",
    {
      preHandler: [authenticate, authorizeOrganizer],
    },
    deleteEventHandler
  );
}
