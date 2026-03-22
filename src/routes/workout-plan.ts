import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  ConflictError,
  NotFoundError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CompleteWorkoutSessionBodySchema,
  CompleteWorkoutSessionSchema,
  ErrorSchema,
  ListWorkoutPlansQuerySchema,
  ListWorkoutPlansSchema,
  setLogExerciseBody,
  setLogExerciseCompleteResponse,
  setLogExerciseResponse,
  WorkoutDayDetailsSchema,
  WorkoutPlanDetailsSchema,
  WorkoutPlanSchema,
  WorkoutSessionSchema,
} from "../schemas/index.js";
import { CompleteExerciseSet } from "../usecases/workout-plan/complete-exercise-set.js";
import { CompleteWorkoutSession } from "../usecases/workout-plan/complete-workout-session.js";
import { CreateWorkoutPlan } from "../usecases/workout-plan/create-workout-plan.js";
import { GetWorkoutDayDetails } from "../usecases/workout-plan/get-workout-day-details.js";
import { GetWorkoutPlanDetails } from "../usecases/workout-plan/get-workout-plan-details.js";
import { ListWorkoutPlans } from "../usecases/workout-plan/list-workout-plans.js";
import { LogExerciseSet } from "../usecases/workout-plan/log-exercise-set.js";
import { StartWorkoutSession } from "../usecases/workout-plan/start-workout-session.js";

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  // ROUTE LIST WORKOUT PLAN
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "listWorkoutPlans",
      tags: ["Workout Plan"],
      summary: "List workout plans",
      querystring: ListWorkoutPlansQuerySchema,
      response: {
        200: ListWorkoutPlansSchema,
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

        const listWorkoutPlans = new ListWorkoutPlans();
        const result = await listWorkoutPlans.execute({
          userId: session.user.id,
          active: request.query.active,
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

  // ROUTE CREATE WORKOUT PLAN
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createWorkoutPlan",
      tags: ["Workout Plan"],
      summary: "Create workout plan",
      body: WorkoutPlanSchema.omit({ id: true }),
      response: {
        201: WorkoutPlanSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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
        const createWorkoutPlan = new CreateWorkoutPlan();
        const result = await createWorkoutPlan.execute({
          userId: session.user.id,
          name: request.body.name,
          workoutDays: request.body.workoutDays,
        });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // ROUTE GET WORKOUT PLAN DETAILS
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId",
    schema: {
      operationId: "getWorkoutPlan",
      tags: ["Workout Plan"],
      summary: "Get workout plan details",
      params: z.object({
        workoutPlanId: z.uuid(),
      }),
      response: {
        200: WorkoutPlanDetailsSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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
        const getWorkoutPlanDetails = new GetWorkoutPlanDetails();
        const result = await getWorkoutPlanDetails.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // ROUTE GET WORKOUT DAY DETAILS
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId/days/:workoutDayId",
    schema: {
      operationId: "getWorkoutDay",
      tags: ["Workout Plan"],
      summary: "Get workout day details",
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
      }),
      response: {
        200: WorkoutDayDetailsSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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
        const getWorkoutDayDetails = new GetWorkoutDayDetails();
        const result = await getWorkoutDayDetails.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
          workoutDayId: request.params.workoutDayId,
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // ROUTE CREATE WORKOUT SESSION
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:workoutPlanId/days/:workoutDayId/sessions",
    schema: {
      operationId: "startWorkoutSession",
      tags: ["Workout Plan"],
      summary: "Start a workout session",
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
      }),
      response: {
        201: WorkoutSessionSchema,
        422: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
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
        const startWorkoutSession = new StartWorkoutSession();
        const result = await startWorkoutSession.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
          workoutDayId: request.params.workoutDayId,
        });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        if (error instanceof WorkoutPlanNotActiveError) {
          return reply.status(422).send({
            error: error.message,
            code: "WORKOUT_PLAN_NOT_ACTIVE",
          });
        }
        if (error instanceof ConflictError) {
          return reply.status(409).send({
            error: error.message,
            code: "CONFLICT_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // ROUTE COMPLETE WORKOUT SESSION
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId/days/:workoutDayId/sessions/:sessionId",
    schema: {
      operationId: "completeWorkoutSession",
      tags: ["Workout Plan"],
      summary: "Update a workout session",
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
        sessionId: z.uuid(),
      }),
      body: CompleteWorkoutSessionBodySchema,
      response: {
        200: CompleteWorkoutSessionSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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
        const completeWorkoutSession = new CompleteWorkoutSession();
        const result = await completeWorkoutSession.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
          workoutDayId: request.params.workoutDayId,
          sessionId: request.params.sessionId,
          completedAt: request.body.completedAt,
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
  // WOURKS SET EXERCISE START
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/sessions/:sessionId/exercises/:exerciseId/sets",
    schema: {
      operationId: "logExerciseSet",
      summary: "Log exercise set",
      tags: ["Workout"],
      params: z.object({
        sessionId: z.uuid(),
        exerciseId: z.uuid(),
      }),
      body: setLogExerciseBody,
      response: {
        200: setLogExerciseResponse,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
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

        const setLogExercise = new LogExerciseSet();

        const result = await setLogExercise.execute({
          userId: session.user.id,
          sessionId: request.params.sessionId,
          exerciseId: request.params.exerciseId,
          ...request.body,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }

        if (error instanceof ConflictError) {
          return reply
            .status(409)
            .send({ error: error.message, code: "CONFLICT" });
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // WORKOUT SET EXERCISE COMPLETE
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/sets/:setId/complete",
    schema: {
      operationId: "completeExerciseSet",
      tags: ["Workout"],
      summary: "Mark exercise set as completed",
      params: z.object({
        setId: z.uuid(),
      }),
      response: {
        200: setLogExerciseCompleteResponse,
        401: ErrorSchema,
        409: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },

    handler: async (request, reply) => {
      try {
        // 🔐 auth
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "Unauthorized",
          });
        }
        const setLogExerciseComplete = new CompleteExerciseSet();

        const result = await setLogExerciseComplete.execute({
          setId: request.params.setId,
          userId: session.user.id,
        });

        return reply.status(200).send({
          id: result.id,
          completed: result.completed,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }

        if (error instanceof ConflictError) {
          return reply.status(409).send({
            error: error.message,
            code: "CONFLICT",
          });
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
