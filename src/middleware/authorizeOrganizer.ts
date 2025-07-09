import { FastifyRequest, FastifyReply } from "fastify";

export async function authorizeOrganizer(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user || user.role !== "ORGANIZER") {
    return reply
      .status(403)
      .send({ error: "Access allowed only for organizers." });
  }
}
