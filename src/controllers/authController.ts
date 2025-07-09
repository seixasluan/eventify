import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, email, password, role } = request.body as any;

  if (!name || !email || !password || !role) {
    return reply.status(400).send({ error: "All fields must be filled in!" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return reply.status(400).send({ error: "Email is already in use!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  return reply.send({ token });
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as any;

  if (!email || !password) {
    return reply.status(400).send({ error: "All fields must be filled in!" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.status(401).send({ error: "Invalid credentials!" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return reply.status(401).send({ error: "Invalid credentials!" });
  }

  const token = generateToken({ userId: user.id, role: user.role });
  return reply.send({ token });
}
