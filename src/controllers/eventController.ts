import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../prisma";
import { validateEventInput } from "../validators/eventValidator";
import path from "path";
import fs from "fs";
import { MultipartFile } from "@fastify/multipart";

export async function createEventHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as any;
  const user = (request as any).user;

  const { valid, errors, parsedDate, parsedTotalTickets } =
    validateEventInput(data);
  if (!valid || !parsedDate || !parsedTotalTickets) {
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
        totalTickets: parsedTotalTickets,
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

export async function listOrganizerEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (user.role !== "ORGANIZER") {
    return reply
      .status(403)
      .send({ error: "Only organizers can view their events." });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        organizerId: user.userId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return reply.send(events);
  } catch (error) {
    console.log(error);
    return reply
      .status(500)
      .send({ error: "Error fetching organizer events." });
  }
}

export async function getEventStatsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;
  const { id } = request.params as { id: string };

  if (user.role !== "ORGANIZER") {
    return reply.status(403).send({ error: "Only organizers can view stats." });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!event) {
      return reply.status(404).send({ error: "Event not found. " });
    }

    if (event.organizerId !== user.userId) {
      return reply.status(403).send({ error: "You don't own this event." });
    }

    return reply.send({
      id: event.id,
      title: event.title,
      totalTickets: event.totalTickets,
      ticketsSold: event.ticketsSold,
      remainingTickets: event.totalTickets - event._count.tickets,
      earnings: event.ticketsSold * event.price,
    });
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ error: "Error fetching event stats." });
  }
}

export async function uploadEventImageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const user = (request as any).user;

  // check owner
  const event = await prisma.event.findUnique({
    where: { id: Number(id) },
  });

  if (!event || event.organizerId !== user.userId) {
    return reply
      .status(403)
      .send({ error: "You don't have permission to modify this event." });
  }

  // get uploaded file
  const file = await (request as any).file();

  if (!file) {
    return reply.status(400).send({ error: "No file uploaded." });
  }

  // save file to disk
  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filename = `event-${id}-${Date.now()}-${file.filename}`;
  const filepath = path.join(uploadsDir, filename);

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(filepath);
    file.file.pipe(stream);
    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });

  const imageUrl = `/uploads/${filename}`;

  await prisma.event.update({
    where: { id: Number(id) },
    data: { imageUrl },
  });

  return reply.send({ message: "Image uploaded successfully.", imageUrl });
}

export async function deleteEventImageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const user = (request as any).user;

  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!event || event.organizerId !== user.userId) {
      return reply
        .status(403)
        .send({ error: "You don't have permission to modify this event." });
    }

    if (!event.imageUrl) {
      return reply
        .status(400)
        .send({ error: "This event does not have an image." });
    }

    // Resolve o caminho absoluto do arquivo
    const uploadsDir = path.join(__dirname, "..", "..");
    const absolutePath = path.join(uploadsDir, event.imageUrl);

    // Tenta remover o arquivo do disco
    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.error("Failed to delete file:", err);
        // Opcional: pode decidir continuar mesmo se falhar
      }
    });

    // Limpa a imageUrl no banco
    await prisma.event.update({
      where: { id: Number(id) },
      data: {
        imageUrl: null,
      },
    });

    return reply.send({ message: "Event image successfully removed." });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Error removing event image." });
  }
}
