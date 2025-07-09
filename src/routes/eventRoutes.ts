import { FastifyInstance } from "fastify";
import {
  createEventHandler,
  getEventsHandler,
  updateEventHandler,
  deleteEventHandler,
} from "../controllers/eventController";
import { authenticate } from "../middleware/auth";
import { authorizeOrganizer } from "../middleware/authorizeOrganizer";

export async function eventRoutes(fastify: FastifyInstance) {
  fastify.get("/events", getEventsHandler);

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
