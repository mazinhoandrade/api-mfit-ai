import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ErrorSchema } from "../schemas/index.js";

export const pingTestRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      description: "Rota de teste",
      tags: ["Ping"],
      response: {
        200: z.object({
          message: z.string(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: () => {
      return { message: "pong" };
    },
  });
};
