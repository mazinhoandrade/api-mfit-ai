import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
}

export interface OutputDto {
  metrics: Array<{
    id: string;
    weightInGrams?: number;
    heightInCentimeters?: number;
    age?: number;
    bodyFatPercentage?: number;
    createdAt: string;
  }>;
}

export class GetUserMetrics {
  async execute(dto: InputDto): Promise<OutputDto> {
    const metrics = await prisma.bodyMetric.findMany({
      where: { userId: dto.userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      metrics: metrics.map((m) => ({
        id: m.id,
        weightInGrams: m.weightInGrams ?? undefined,
        heightInCentimeters: m.heightInCentimeters ?? undefined,
        age: m.age ?? undefined,
        bodyFatPercentage: m.bodyFatPercentage ?? undefined,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }
}
