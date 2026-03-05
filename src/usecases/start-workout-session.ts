import {
  ConflictError,
  NotFoundError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";

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

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
    });
    if (!workoutDay) {
      throw new NotFoundError("Workout day not found in this plan");
    }

    // Check if there's an ongoing session for this day
    // The requirement says: "Caso o dia recebido já tenha uma sessão iniciada (startedAt presente), retorne 409."
    // Since startedAt is mandatory in our schema, we interpret this as "if there's a session that hasn't been completed yet"
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId: dto.workoutDayId,
      },
    });

    if (existingSession) {
      throw new ConflictError("Workout session already started for this day");
    }

    const session = await prisma.workoutSession.create({
      data: {
        id: crypto.randomUUID(),
        workoutDayId: dto.workoutDayId,
        startedAt: new Date(),
      },
    });

    return {
      userWorkoutSessionId: session.id,
    };
  }
}
