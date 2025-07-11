import { FastifyInstance } from "fastify";
import {
  createEventHandler,
  getEventHandler,
  updateEventHandler,
  deleteEventHandler,
  listPublicEventsHandler,
  listOrganizerEventsHandler,
  getEventStatsHandler,
} from "../controllers/eventController";
import { authenticate } from "../middleware/auth";
import { authorizeOrganizer } from "../middleware/authorizeOrganizer";

export async function eventRoutes(fastify: FastifyInstance) {
  // get
  fastify.get("/events", listPublicEventsHandler);
  fastify.get(
    "/events/mine",
    { preHandler: [authenticate, authorizeOrganizer] },
    listOrganizerEventsHandler
  );
  fastify.get("/events/:id", { preHandler: [authenticate] }, getEventHandler);
  fastify.get(
    "/events/:id/stats",
    { preHandler: [authenticate, authorizeOrganizer] },
    getEventStatsHandler
  );

  // post
  fastify.post(
    "/events",
    {
      preHandler: [authenticate, authorizeOrganizer],
    },
    createEventHandler
  );

  // put
  fastify.put(
    "/events/:id",
    {
      preHandler: [authenticate, authorizeOrganizer],
    },
    updateEventHandler
  );

  // delete
  fastify.delete(
    "/events/:id",
    {
      preHandler: [authenticate, authorizeOrganizer],
    },
    deleteEventHandler
  );
}
