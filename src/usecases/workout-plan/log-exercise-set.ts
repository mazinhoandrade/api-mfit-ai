import { ConflictError, NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
  sessionId: string;
  exerciseId: string;
  weight?: number;
  reps?: number;
  durationInSeconds?: number;
  distanceInMeters?: number;
}

interface OutputDto {
  id: string;
  order: number;
}

export class LogExerciseSet {
  async execute(dto: InputDto): Promise<OutputDto> {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: dto.sessionId,
        userId: dto.userId,
      },
    });

    if (!session) {
      throw new NotFoundError("Workout session not found");
    }

    if (!session.isActive) {
      throw new ConflictError("Workout session already finished");
    }

    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: dto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError("Exercise not found");
    }

    if (exercise.workoutDayId !== session.workoutDayId) {
      throw new ConflictError("Exercise does not belong to this session");
    }

    if (exercise.metricType === "WEIGHT_REPS") {
      if (!dto.weight || !dto.reps) {
        throw new ConflictError("Weight and reps are required");
      }
    }

    if (exercise.metricType === "REPS_ONLY") {
      if (!dto.reps) {
        throw new ConflictError("Reps are required");
      }
    }

    if (exercise.metricType === "TIME") {
      if (!dto.durationInSeconds) {
        throw new ConflictError("Duration is required");
      }
    }

    if (exercise.metricType === "DISTANCE_TIME") {
      if (!dto.durationInSeconds || !dto.distanceInMeters) {
        throw new ConflictError("Distance and duration are required");
      }
    }

    let log = await prisma.exerciseLog.findUnique({
      where: {
        sessionId_exerciseId: {
          sessionId: dto.sessionId,
          exerciseId: dto.exerciseId,
        },
      },
    });

    if (!log) {
      log = await prisma.exerciseLog.create({
        data: {
          sessionId: dto.sessionId,
          exerciseId: dto.exerciseId,
        },
      });
    }

    const lastSet = await prisma.exerciseSet.findFirst({
      where: {
        logId: log.id,
      },
      orderBy: {
        order: "desc",
      },
    });

    const nextOrder = (lastSet?.order ?? 0) + 1;

    const set = await prisma.exerciseSet.create({
      data: {
        logId: log.id,
        order: nextOrder,
        weight: dto.weight,
        reps: dto.reps,
        durationInSeconds: dto.durationInSeconds,
        distanceInMeters: dto.distanceInMeters,
      },
    });

    return {
      id: set.id,
      order: set.order,
    };
  }
}
