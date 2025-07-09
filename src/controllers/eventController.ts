import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../prisma";

export async function createEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { title, description, date, price, imageUrl } = request.body as any;
  const user = (request as any).user;

  if (!title || !description || !date || !price || !imageUrl) {
    return reply
      .status(400)
      .send({ error: "Todos os campos são obrigatórios." });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return reply
      .status(400)
      .send({ error: "Data inválida. Use formato YYYY-MM-DD." });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return reply
      .status(400)
      .send({ error: "Preço inválido. Use número ou string com ponto." });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        price: parseFloat(price),
        imageUrl,
        organizerId: user.userId,
      },
    });

    return reply.status(201).send(event);
  } catch (error) {
    return reply.status(500).send({ error: "Error creating event." });
  }
}

export async function getEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const events = await prisma.event.findMany({
    include: {
      organizer: {
        select: { name: true, email: true },
      },
    },
  });

  return reply.send(events);
}

export async function updateEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as any;
  const { title, description, date, price, imageUrl } = request.body as any;

  const user = (request as any).user;

  const event = await prisma.event.findUnique({ where: { id: Number(id) } });

  if (!event || event.organizerId !== user.userId) {
    return reply
      .status(403)
      .send({ error: "You don't have permission to edit this event." });
  }

  const updated = await prisma.event.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      date: new Date(date),
      price,
      imageUrl,
    },
  });

  return reply.send(updated);
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
