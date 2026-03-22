import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "../lib/auth.js";
import {
  BodyDietResponseSchema,
  BodyMetricResponseSchema,
  ErrorSchema,
  UpsertBodyDietBodySchema,
  UpsertBodyMetricBodySchema,
  UpsertUserTrainDataBodySchema,
  UpsertUserTrainDataSchema,
  UserTrainDataSchema,
  UserTrainDietSchema,
  UserTrainMetricSchema,
} from "../schemas/index.js";
import { GetUserDiets } from "../usecases/me/get-user-diets.js";
import { GetUserMetrics } from "../usecases/me/get-user-metrics.js";
import { GetUserTrainData } from "../usecases/me/get-user-train-data.js";
import { UpsertBodyDiets } from "../usecases/me/upsert-body-diets.js";
import { UpsertBodyMetric } from "../usecases/me/upsert-body-metric.js";
import { UpsertUserTrainData } from "../usecases/me/upsert-user-train-data.js";

export const meRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getMeTrainData",
      tags: ["Me"],
      summary: "Get user train data",
      response: {
        200: UserTrainDataSchema.nullable(),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "Unauthorized",
          });
        }
        const getUserTrainData = new GetUserTrainData();
        const result = await getUserTrainData.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/metrics",
    schema: {
      operationId: "getMyMetrics",
      tags: ["Me"],
      summary: "Get my body metrics history",
      response: {
        200: UserTrainMetricSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },

    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "Unauthorized",
          });
        }

        const getUserMetrics = new GetUserMetrics();

        const result = await getUserMetrics.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/metrics",
    schema: {
      operationId: "upsertBodyMetric",
      tags: ["Me"],
      summary: "Create or get latest body metric",
      body: UpsertBodyMetricBodySchema,
      response: {
        200: BodyMetricResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },

    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const upsertBodyMetric = new UpsertBodyMetric();

        const result = await upsertBodyMetric.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/",
    schema: {
      operationId: "upsertMe",
      tags: ["Me"],
      summary: "Upsert my train data",
      body: UpsertUserTrainDataBodySchema,
      response: {
        200: UpsertUserTrainDataSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "Unauthorized",
          });
        }
        const upsertUserTrainData = new UpsertUserTrainData();
        const result = await upsertUserTrainData.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // diet
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/diets",
    schema: {
      operationId: "getMyDiets",
      tags: ["Me"],
      summary: "Get my body diets history",
      response: {
        200: UserTrainDietSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },

    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "Unauthorized",
          });
        }

        const getUserDiets = new GetUserDiets();

        const result = await getUserDiets.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/diets",
    schema: {
      operationId: "upsertBodyDiet",
      tags: ["Me"],
      summary: "Create or get latest body diet",
      body: UpsertBodyDietBodySchema,
      response: {
        200: BodyDietResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },

    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const upsertBodyDiet = new UpsertBodyDiets();

        const result = await upsertBodyDiet.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
