import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddLearningPathCourseDto } from "./dto/add-learning-path-course.dto";
import { CreateLearningPathDto } from "./dto/create-learning-path.dto";

@Injectable()
export class LearningPathsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: {
              include: {
                technicalArea: true,
              },
            },
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

  create(dto: CreateLearningPathDto) {
    return this.prisma.learningPath.create({
      data: {
        slug: dto.slug,
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        description: dto.description,
        levelCode: dto.levelCode,
      },
    });
  }

  addCourse(dto: AddLearningPathCourseDto) {
    return this.prisma.learningPathCourse.create({
      data: {
        learningPathId: dto.learningPathId,
        courseId: dto.courseId,
        sortOrder: dto.sortOrder,
        isRequired: dto.isRequired,
      },
      include: {
        learningPath: true,
        course: true,
      },
    });
  }
}
