import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany({
      include: {
        technicalArea: true,
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        technicalAreaId: dto.technicalAreaId,
        slug: dto.slug,
        code: dto.code,
        courseKind: dto.courseKind ?? "STANDARD",
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        descriptionEs: dto.descriptionEs,
        descriptionEn: dto.descriptionEn,
        isPublished: dto.isPublished ?? false,
        progressStrategy: dto.progressStrategy ?? "weighted",
        lessonWeight: dto.lessonWeight ?? 20,
        practiceWeight: dto.practiceWeight ?? 30,
        evaluationWeight: dto.evaluationWeight ?? 20,
        simulatorWeight: dto.simulatorWeight ?? 30,
      },
      include: {
        technicalArea: true,
        learningPaths: true,
        certificationMap: true,
      },
    }).then(async (course) => {
      await this.prisma.auditLog.create({
        data: {
          action: "COURSE_CREATED",
          entityType: "Course",
          entityId: course.id,
          meta: {
            technicalAreaId: dto.technicalAreaId,
            slug: dto.slug,
          },
        },
      });

      return course;
    });
  }
}
