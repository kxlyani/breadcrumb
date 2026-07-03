import Fastify, { type FastifyError } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import { config } from "./config/config";
import { logger } from "./infra/logger/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { workspaceMiddleware } from "./middleware/workspace.middleware";
import { workspaceRoutes } from "./modules/workspace/workspace.routes";
import { issueRoutes } from "./modules/issues/issues.routes";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(authMiddleware);
  app.register(workspaceMiddleware);

  app.register(fastifyCors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  app.register(fastifyJwt, {
    secret: config.JWT_SECRET,
  });

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  app.register(authRoutes, { prefix: "/api/v1/auth" });
  app.register(workspaceRoutes, { prefix: "/api/v1/workspaces" });
  app.register(issueRoutes, {
    prefix: "/api/v1/workspaces/:workspaceId/issues",
  });

  // Type error is fixed by annotating `error` as FastifyError
  app.setErrorHandler((error: FastifyError, request, reply) => {
    // Read custom properties attached via Object.assign in services
    const statusCode = (error as any).statusCode ?? 500;
    const code = (error as any).code ?? "INTERNAL_ERROR";

    // Only log true 500s — expected errors (4xx) are not server errors
    if (statusCode >= 500) {
      logger.error({ err: error, url: request.url }, "Unhandled error");
    }

    reply.status(statusCode).send({
      success: false,
      error: {
        code,
        message:
          statusCode >= 500 && config.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error.message,
      },
    });
  });

  return app;
}
