import { ConflictError, NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  setId: string;
  userId: string;
}

interface OutputDto {
  id: string;
  completed: boolean;
}

export class CompleteExerciseSet {
  async execute(dto: InputDto): Promise<OutputDto> {
    const set = await prisma.exerciseSet.findUnique({
      where: { id: dto.setId },
      select: {
        id: true,
        completed: true,
        log: {
          select: {
            session: {
              select: {
                userId: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!set) {
      throw new NotFoundError("Set not found");
    }

    if (set.log.session.userId !== dto.userId) {
      throw new ConflictError("Not allowed");
    }

    if (!set.log.session.isActive) {
      throw new ConflictError("Workout session already finished");
    }

    if (set.completed) {
      throw new ConflictError("Set already completed");
    }

    return prisma.exerciseSet.update({
      where: { id: dto.setId },
      data: {
        completed: true,
      },
      select: {
        id: true,
        completed: true,
      },
    });
  }
}
