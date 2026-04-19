import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.lesson.findMany({
      include: {
        module: {
          include: {
            course: {
              include: {
                technicalArea: true,
              },
            },
          },
        },
        practices: true,
        resources: true,
      },
      orderBy: [
        {
          moduleId: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    });
  }

  create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: dto,
      include: {
        module: true,
      },
    });
  }
}
