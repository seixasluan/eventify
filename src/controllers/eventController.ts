import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../prisma";
import { validateEventInput } from "../validators/eventValidator";

export async function createEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as any;
  const user = (request as any).user;

  const { valid, errors, parsedDate } = validateEventInput(data);
  if (!valid || !parsedDate) {
    return reply.status(400).send({ errors });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: parsedDate,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl,
        organizerId: user.userId,
      },
    });

    return reply.status(201).send(event);
  } catch (error) {
    return reply.status(500).send({ error: "Error creating event." });
  }
}

export async function getEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      return reply.status(404).send({ error: "Event not found." });
    }

    return reply.send(event);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao buscar evento." });
  }
}

export async function updateEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as any;
  const data = request.body as any;

  const user = (request as any).user;

  const event = await prisma.event.findUnique({ where: { id: Number(id) } });

  if (!event || event.organizerId !== user.userId) {
    return reply
      .status(403)
      .send({ error: "You don't have permission to edit this event." });
  }

  const { valid, errors, parsedDate } = validateEventInput(data);
  if (!valid || !parsedDate) {
    return reply.status(400).send({ errors });
  }

  try {
    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        description: data.description,
        date: parsedDate,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl,
      },
    });

    return reply.send(updated);
  } catch (error) {
    return reply.status(500).send({ error: "Error updating event." });
  }
}

export async function deleteEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as any;
  const user = (request as any).user;

  const event = await prisma.event.findUnique({ where: { id: Number(id) } });

  if (!event || event.organizerId !== user.userId) {
    return reply
      .status(403)
      .send({ error: "You don't have permission to delete this event." });
  }

  await prisma.event.delete({ where: { id: Number(id) } });

  return reply.status(204).send();
}

export async function listPublicEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return reply.send(events);
  } catch (error) {
    console.log(error);
    return reply.status(404).send({ error: "Error to list events." });
  }
}
