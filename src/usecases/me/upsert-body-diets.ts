import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface OutputDto {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export class UpsertBodyDiets {
  async execute(dto: InputDto): Promise<OutputDto> {
    const hasDiets = Object.values(dto).some(
      (v) => v !== undefined && v !== dto.userId,
    );

    let diet;

    if (hasDiets) {
      diet = await prisma.dietLog.create({
        data: {
          userId: dto.userId,
          calories: dto.calories,
          protein: dto.protein,
          carbs: dto.carbs,
          fat: dto.fat,
        },
      });
    } else {
      diet = await prisma.dietLog.findFirst({
        where: { userId: dto.userId },
        orderBy: { createdAt: "desc" },
      });

      if (!diet) {
        throw new Error("No metrics found");
      }
    }

    return {
      id: diet.id,
      calories: diet.calories,
      protein: diet.protein,
      carbs: diet.carbs,
      fat: diet.fat,
      createdAt: diet.createdAt.toISOString(),
    };
  }
}
