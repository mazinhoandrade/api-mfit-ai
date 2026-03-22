import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

export interface OutputDto {
  userId: string;
  name: string;
  // weightInGrams: number;
  // heightInCentimeters: number;
  // age: number;
  // bodyFatPercentage: number; // 1 representa 100%
}

export class GetUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto | null> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      name: user.name,
    };
  }
}
