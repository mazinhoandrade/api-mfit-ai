import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
  weightInGrams?: number;
  heightInCentimeters?: number;
  age?: number;
  bodyFatPercentage?: number;
}

export interface OutputDto {
  id: string;
  weightInGrams?: number;
  heightInCentimeters?: number;
  age?: number;
  bodyFatPercentage?: number;
  createdAt: string;
}

export class UpsertBodyMetric {
  async execute(dto: InputDto): Promise<OutputDto> {
    const hasMetrics = Object.values(dto).some(
      (v) => v !== undefined && v !== dto.userId,
    );

    let metric;

    if (hasMetrics) {
      metric = await prisma.bodyMetric.create({
        data: {
          userId: dto.userId,
          weightInGrams: dto.weightInGrams ?? null,
          heightInCentimeters: dto.heightInCentimeters ?? null,
          age: dto.age ?? null,
          bodyFatPercentage: dto.bodyFatPercentage ?? null,
        },
      });
    } else {
      metric = await prisma.bodyMetric.findFirst({
        where: { userId: dto.userId },
        orderBy: { createdAt: "desc" },
      });

      if (!metric) {
        throw new Error("No metrics found");
      }
    }

    return {
      id: metric.id,
      weightInGrams: metric.weightInGrams ?? undefined,
      heightInCentimeters: metric.heightInCentimeters ?? undefined,
      age: metric.age ?? undefined,
      bodyFatPercentage: metric.bodyFatPercentage ?? undefined,
      createdAt: metric.createdAt.toISOString(),
    };
  }
}
