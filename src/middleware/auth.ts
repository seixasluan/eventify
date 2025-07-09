import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = "eventify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: "Token not found!" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    const decoded = jwt.verify(token, JWT_SECRET);
    // Optional: keep in request
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Expired or invalid token!" });
  }
}
