import { prisma } from "../../lib/db.js";

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
    const { userId, name } = dto;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return {
      userId: user.id,
      name: user.name,
    };
  }
}
