import type { FastifyInstance } from "fastify";
import { authService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { config } from "../../config/config";
import { prisma } from "../../infra/db/prisma";

export async function authRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/register
  app.post("/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const user = await authService.register(parsed.data);
    const token = app.jwt.sign(
      { userId: user.id },
      { expiresIn: config.JWT_EXPIRES_IN },
    );

    return reply.status(201).send({
      success: true,
      data: { token, user },
    });
  });

  // POST /api/v1/auth/login
  app.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const user = await authService.login(parsed.data);
    const token = app.jwt.sign({ userId: user.id }, { expiresIn: "7d" });

    return reply.status(200).send({
      success: true,
      data: { token, user },
    });
  });

  // GET /api/v1/auth/me  — protected route
  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = request.user as { userId: string };
      const user = await authService.getUserById(payload.userId);

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }

      return reply.send({ success: true, data: { user } });
    },
  );

  // POST /api/v1/auth/tokens — generate an API token
  app.post(
    "/tokens",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = request.user as { userId: string };

      // Generate a secure random token
      const crypto = await import("crypto");
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Hash it before storing — same principle as passwords
      const bcrypt = await import("bcryptjs");
      const tokenHash = await bcrypt.hash(rawToken, 10);

      await prisma.apiToken.create({
        data: {
          userId: payload.userId,
          tokenHash,
          label: "CLI token",
        },
      });

      // Return the raw token ONCE — we never store it in plaintext
      return reply.status(201).send({
        success: true,
        data: {
          token: rawToken,
          note: "Save this token — it will not be shown again.",
        },
      });
    },
  );

  // GET /api/v1/auth/tokens — list tokens (without revealing values)
  app.get(
    "/tokens",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const payload = request.user as { userId: string };

      const tokens = await prisma.apiToken.findMany({
        where: { userId: payload.userId },
        select: {
          id: true,
          label: true,
          lastUsedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return reply.send({ success: true, data: tokens });
    },
  );
}
