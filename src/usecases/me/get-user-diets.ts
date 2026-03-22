import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
}

export interface OutputDto {
  diets: Array<{
    id: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    createdAt: string;
  }>;
}

export class GetUserDiets {
  async execute(dto: InputDto): Promise<OutputDto> {
    const diets = await prisma.dietLog.findMany({
      where: { userId: dto.userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      diets: diets.map((d) => ({
        id: d.id,
        calories: d.calories,
        protein: d.protein,
        carbs: d.carbs,
        fat: d.fat,
        createdAt: d.createdAt.toISOString(),
      })),
    };
  }
}
