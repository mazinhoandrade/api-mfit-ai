import z from "zod";

import { ExerciseMetricType, WeekDay } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const ListWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const ListWorkoutPlansSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRest: z.boolean(),
        estimatedDurationInSeconds: z.number(),
        coverImageUrl: z.url().optional(),
        exercises: z.array(
          z.object({
            id: z.uuid(),
            order: z.number(),
            name: z.string(),
            sets: z.number().nullable(),
            reps: z.number().nullable(),
            restTimeInSeconds: z.number().nullable(),
          }),
        ),
      }),
    ),
  }),
);

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      weekDay: z.enum(WeekDay),
      isRest: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      coverImageUrl: z.url().optional(),
      exercises: z.array(
        z.object({
          order: z.number().min(0),
          name: z.string().trim().min(1),
          sets: z.number().nullable().optional(),
          reps: z.number().nullable().optional(),
          suggestedWeight: z.number().nullable().optional(),
          metricType: z.enum(ExerciseMetricType),
          restTimeInSeconds: z.number().nullable().optional(),
        }),
      ),
    }),
  ),
});

export const WorkoutSessionSchema = z.object({
  userWorkoutSessionId: z.uuid(),
});

export const CompleteWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

export const CompleteWorkoutSessionSchema = z.object({
  id: z.uuid(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
});

export const WorkoutPlanDetailsSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.url().optional(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
});

export const WorkoutDayDetailsSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.url().optional(),
  estimatedDurationInSeconds: z.number(),
  exercises: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.uuid(),
      sets: z.number().nullable(),
      reps: z.number().nullable(),
      restTimeInSeconds: z.number().nullable(),
    }),
  ),
  weekDay: z.enum(WeekDay),
  sessions: z.array(
    z.object({
      id: z.uuid(),
      workoutDayId: z.uuid(),
      startedAt: z.iso.date().optional(),
      completedAt: z.iso.date().optional(),
    }),
  ),
});

export const StatsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export const StatsSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});

export const HomeDataSchema = z.object({
  activeWorkoutPlanId: z.uuid().optional(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.uuid(),
      id: z.uuid(),
      name: z.string(),
      isRest: z.boolean(),
      weekDay: z.enum(WeekDay),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.url().optional(),
      exercisesCount: z.number(),
    })
    .optional(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
});

// User Train Data
export const UserTrainDataSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  weightInGrams: z.number().optional(),
  heightInCentimeters: z.number().optional(),
  age: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
});

export const UserTrainMetricSchema = z.object({
  metrics: z.array(
    z.object({
      id: z.string(),
      weightInGrams: z.number().min(0).optional(),
      heightInCentimeters: z.number().min(0).optional(),
      age: z.number().min(0).optional(),
      bodyFatPercentage: z.number().min(0).max(100).optional(),
      createdAt: z.string(),
    }),
  ),
});

export const UpsertUserTrainDataBodySchema = z.object({
  name: z.string(),
});

export const UpsertUserTrainDataSchema = z.object({
  userId: z.string(),
  name: z.string(),
});

export const UpsertBodyMetricBodySchema = z.object({
  weightInGrams: z.number().optional(),
  heightInCentimeters: z.number().optional(),
  age: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
});

export const BodyMetricResponseSchema = z.object({
  id: z.string(),
  weightInGrams: z.number().optional(),
  heightInCentimeters: z.number().optional(),
  age: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
  createdAt: z.string(),
});

// Log Exercise
export const setLogExerciseBody = z.object({
  weight: z.number().optional(),
  reps: z.number().optional(),
  durationInSeconds: z.number().optional(),
  distanceInMeters: z.number().optional(),
});

export const setLogExerciseResponse = z.object({
  id: z.string(),
  order: z.number(),
});

export const setLogExerciseCompleteResponse = z.object({
  id: z.string(),
  completed: z.boolean(),
});
