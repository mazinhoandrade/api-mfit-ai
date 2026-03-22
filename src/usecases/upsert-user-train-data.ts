import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  name: string;
}

export interface OutputDto {
  userId: string;
  name: string;
}

export class UpsertUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.update({
      where: { id: dto.userId },
      data: dto,
    });

    return {
      userId: user.id,
      name: user.name,
    };
  }
}
