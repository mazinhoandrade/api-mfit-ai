import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
}

export interface OutputDto {
  userId: string;
  name: string;
  email: string;

  weightInGrams?: number;
  heightInCentimeters?: number;
  age?: number;
  bodyFatPercentage?: number;
}

export class GetUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto | null> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const lastMetric = await prisma.bodyMetric.findFirst({
      where: { userId: dto.userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      userId: user.id,
      name: user.name,
      email: user.email,

      weightInGrams: lastMetric?.weightInGrams ?? undefined,
      heightInCentimeters: lastMetric?.heightInCentimeters ?? undefined,
      age: lastMetric?.age ?? undefined,
      bodyFatPercentage: lastMetric?.bodyFatPercentage ?? undefined,
    };
  }
}
