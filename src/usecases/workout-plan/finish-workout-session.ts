import { ConflictError, NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
  sessionId: string;
  workoutPlanId: string;
  workoutDayId: string;
  completedAt?: string;
  exercises: Array<{
    restTimeInSeconds: number;
    exerciseId: string;
    sets: Array<{
      order: number;
      weight?: number;
      reps?: number;
      durationInSeconds?: number;
      distanceInMeters?: number;
    }>;
  }>;
}

interface OutputDto {
  id: string;
  completed: boolean;
  completedAt: string;
  startedAt: string;
}

export class FinishWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: dto.workoutPlanId,
      },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found or not owned by user");
    }

    const session = await prisma.workoutSession.findFirst({
      where: {
        id: dto.sessionId,
        userId: dto.userId,
        workoutDayId: dto.workoutDayId,
      },
    });

    if (!session) throw new NotFoundError("Session not found");
    if (!session.isActive) throw new ConflictError("Session already finished");

    return prisma.$transaction(async (tx) => {
      for (const exerciseInput of dto.exercises) {
        const exercise = await tx.workoutExercise.findUnique({
          where: { id: exerciseInput.exerciseId },
        });

        if (!exercise)
          throw new NotFoundError(
            `Exercise ${exerciseInput.exerciseId} not found`,
          );

        const log = await tx.exerciseLog.upsert({
          where: {
            sessionId_exerciseId: {
              sessionId: dto.sessionId,
              exerciseId: exercise.id,
            },
          },
          update: { restTimeInSeconds: exerciseInput.restTimeInSeconds },
          create: {
            sessionId: dto.sessionId,
            exerciseId: exercise.id,
            restTimeInSeconds: exerciseInput.restTimeInSeconds,
          },
        });

        for (const setInput of exerciseInput.sets) {
          await tx.exerciseSet.create({
            data: {
              logId: log.id,
              order: setInput.order,
              weight: setInput.weight,
              reps: setInput.reps,
              durationInSeconds: setInput.durationInSeconds,
              distanceInMeters: setInput.distanceInMeters,
              completed: true,
            },
          });
        }
      }

      const now = new Date();
      const updatedSession = await tx.workoutSession.update({
        where: { id: dto.sessionId },
        data: {
          isActive: false,
          completedAt: now,
        },
      });

      return {
        id: updatedSession.id,
        completed: true,
        startedAt: updatedSession.startedAt.toISOString(),
        completedAt: (updatedSession.completedAt ?? now).toISOString(),
      };
    });
  }
}
