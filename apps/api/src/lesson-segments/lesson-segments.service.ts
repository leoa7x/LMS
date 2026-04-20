import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonSegmentDto } from "./dto/create-lesson-segment.dto";

@Injectable()
export class LessonSegmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.lessonSegment.findMany({
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
        resource: true,
      },
      orderBy: [
        {
          lessonId: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    });
  }

  create(dto: CreateLessonSegmentDto) {
    return this.prisma.lessonSegment.create({
      data: {
        lessonId: dto.lessonId,
        type: dto.type,
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        bodyEs: dto.bodyEs,
        bodyEn: dto.bodyEn,
        sortOrder: dto.sortOrder,
        voiceoverEnabled: dto.voiceoverEnabled ?? false,
        resourceId: dto.resourceId,
      },
      include: {
        lesson: true,
        resource: true,
      },
    });
  }
}
