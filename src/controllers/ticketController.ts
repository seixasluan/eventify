import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../prisma";
import { validateTicketInput } from "../validators/ticketValidator";

export async function createTicketHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as any;
  const user = (request as any).user;

  // verify user role
  if (user.role !== "BUYER") {
    return reply.status(403).send({ error: "Only buyers can buy tickets." });
  }

  const { valid, errors } = validateTicketInput(data);
  if (!valid) {
    return reply.status(400).send({ errors });
  }

  try {
    // find event
    const event = await prisma.event.findUnique({
      where: { id: Number(data.eventId) },
    });

    if (!event) {
      return reply.status(404).send({ error: "Event not found." });
    }

    const quantity = Number(data.quantity);
    const totalPrice = event.price * quantity;

    // create ticket
    const ticket = await prisma.ticket.create({
      data: {
        userId: user.userId,
        eventId: event.id,
        quantity,
        totalPrice,
      },
      include: {
        event: true,
      },
    });

    return reply.status(201).send(ticket);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ error: "Error to buy ticket." });
  }
}

export async function listUserTicketsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        event: true,
      },
    });

    return reply.send(tickets);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ error: "Error to find tickets." });
  }
}

export async function getUserTicketHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;
  const { id } = request.params as { id: string };

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) },
      include: { event: true },
    });

    if (!ticket) {
      return reply.status(404).send({ error: "Ticket not found." });
    }

    if (ticket.userId !== user.userId) {
      return reply.status(403).send({ error: "Access denied." });
    }

    return reply.send(ticket);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ error: "Error to find ticket." });
  }
}
