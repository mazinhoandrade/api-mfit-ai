import {
  ConflictError,
  NotFoundError,
  WorkoutPlanNotActiveError,
} from "../../errors/index.js";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  userWorkoutSessionId: string;
}

export class StartWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: dto.workoutPlanId,
      },
      include: {
        workoutDays: {
          where: {
            id: dto.workoutDayId,
          },
        },
      },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found or not owned by user");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("Workout plan is not active");
    }

    const workoutDay = workoutPlan.workoutDays[0];
    if (!workoutDay) {
      throw new NotFoundError("Workout day not found in this plan");
    }
    if (workoutDay.isRest) {
      throw new ConflictError("Workout day is a rest day");
    }

    try {
      const session = await prisma.workoutSession.create({
        data: {
          id: crypto.randomUUID(),
          workoutDayId: dto.workoutDayId,
          userId: dto.userId,
          isActive: true,
          startedAt: new Date(),
        },
      });

      return {
        userWorkoutSessionId: session.id,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" // unique constraint
      ) {
        const existingSession = await prisma.workoutSession.findFirst({
          where: {
            workoutDayId: dto.workoutDayId,
            userId: dto.userId,
            isActive: true,
          },
        });

        if (existingSession) {
          return {
            userWorkoutSessionId: existingSession.id,
          };
        }
      }

      throw error;
    }
  }
}
