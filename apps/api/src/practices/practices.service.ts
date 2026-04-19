import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePracticeDto } from "./dto/create-practice.dto";

@Injectable()
export class PracticesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.practice.findMany({
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        simulatorMappings: {
          include: {
            simulator: true,
          },
        },
      },
      orderBy: {
        titleEs: "asc",
      },
    });
  }

  create(dto: CreatePracticeDto) {
    return this.prisma.practice.create({
      data: {
        lessonId: dto.lessonId,
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        instructions: dto.instructions,
        requiresSimulator: dto.requiresSimulator ?? false,
      },
      include: {
        lesson: true,
      },
    });
  }
}
