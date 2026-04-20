import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EnrollmentStatus, QuizKind } from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { AddLearningPathCourseDto } from "./dto/add-learning-path-course.dto";
import { CreateLearningPathDto } from "./dto/create-learning-path.dto";

@Injectable()
export class LearningPathsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18nService: I18nService,
  ) {}

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

  async assignmentSequence(assignmentId: string, user: JwtPayload) {
    const assignment = await this.prisma.studentLearningPathAssignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        learningPath: {
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    id: true,
                    slug: true,
                    titleEs: true,
                    titleEn: true,
                  },
                },
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
        enrollments: {
          include: {
            progress: true,
          },
        },
      },
    });

    if (!assignment || assignment.institutionId !== user.institutionId) {
      throw new NotFoundException("Learning path assignment not found");
    }

    await this.assertAssignmentAccess(assignmentId, assignment.studentId, user);

    const courseIds = assignment.learningPath.courses.map((item) => item.courseId);
    const postCourseAttempts = await this.prisma.quizAttempt.findMany({
      where: {
        userId: assignment.studentId,
        isPassed: true,
        quiz: {
          kind: QuizKind.POST_COURSE,
          courseId: {
            in: courseIds,
          },
        },
      },
      select: {
        quiz: {
          select: {
            courseId: true,
          },
        },
      },
    });

    const passedPostCourseCourseIds = new Set(
      postCourseAttempts
        .map((attempt) => attempt.quiz.courseId)
        .filter((courseId): courseId is string => Boolean(courseId)),
    );

    const enrollmentsByCourseId = new Map(
      assignment.enrollments.map((enrollment) => [enrollment.courseId, enrollment]),
    );
    const completedRequiredCourses = new Set<string>();

    const sequence = assignment.learningPath.courses.map((item) => {
      const enrollment = enrollmentsByCourseId.get(item.courseId);
      const progressPct = enrollment?.progress[0]?.progressPct ?? 0;
      const isCompleted =
        enrollment?.status === EnrollmentStatus.COMPLETED ||
        passedPostCourseCourseIds.has(item.courseId) ||
        progressPct >= 100;

      const requiredPreviousCourses = assignment.learningPath.courses.filter(
        (candidate) => candidate.isRequired && candidate.sortOrder < item.sortOrder,
      );
      const isUnlocked = requiredPreviousCourses.every((candidate) =>
        completedRequiredCourses.has(candidate.courseId),
      );

      if (item.isRequired && isCompleted) {
        completedRequiredCourses.add(item.courseId);
      }

      return {
        courseId: item.course.id,
        slug: item.course.slug,
        titleEs: item.course.titleEs,
        titleEn: item.course.titleEn,
        localizedTitle: this.i18nService.pick(
          item.course.titleEs,
          item.course.titleEn,
          user.preferredLang,
        ),
        sortOrder: item.sortOrder,
        isRequired: item.isRequired,
        enrollmentId: enrollment?.id ?? null,
        enrollmentStatus: enrollment?.status ?? null,
        progressPct: Number(progressPct.toFixed(2)),
        sequenceStatus: isCompleted
          ? "COMPLETED"
          : isUnlocked
            ? "UNLOCKED"
            : "LOCKED",
      };
    });

    return {
      assignment: {
        id: assignment.id,
        institutionId: assignment.institutionId,
        student: assignment.student,
        assignedLevelCode: assignment.assignedLevelCode,
        status: assignment.status,
        effectiveFrom: assignment.effectiveFrom,
        effectiveUntil: assignment.effectiveUntil,
        learningPath: {
          id: assignment.learningPath.id,
          slug: assignment.learningPath.slug,
          titleEs: assignment.learningPath.titleEs,
          titleEn: assignment.learningPath.titleEn,
          localizedTitle: this.i18nService.pick(
            assignment.learningPath.titleEs,
            assignment.learningPath.titleEn,
            user.preferredLang,
          ),
        },
      },
      sequence,
    };
  }

  private async assertAssignmentAccess(
    assignmentId: string,
    studentId: string,
    user: JwtPayload,
  ) {
    if (user.roles.includes("ADMIN") || user.roles.includes("SUPPORT")) {
      return;
    }

    if (user.roles.includes("STUDENT")) {
      if (user.sub !== studentId) {
        throw new ForbiddenException("Students can only access their own learning paths");
      }

      return;
    }

    if (user.roles.includes("TEACHER")) {
      const scopes = await this.prisma.teacherScopeAssignment.findMany({
        where: {
          teacherUserId: user.sub,
          OR: [{ institutionId: null }, { institutionId: user.institutionId }],
        },
        select: {
          learningPathId: true,
          courseId: true,
          levelCode: true,
        },
      });

      const assignment = await this.prisma.studentLearningPathAssignment.findUnique({
        where: {
          id: assignmentId,
        },
        select: {
          learningPathId: true,
          assignedLevelCode: true,
          enrollments: {
            select: {
              courseId: true,
            },
          },
        },
      });

      if (!assignment) {
        throw new NotFoundException("Learning path assignment not found");
      }

      const canAccess = scopes.some((scope) => {
        if (scope.learningPathId && scope.learningPathId === assignment.learningPathId) {
          return true;
        }

        if (
          scope.levelCode &&
          scope.levelCode === assignment.assignedLevelCode
        ) {
          return true;
        }

        if (
          scope.courseId &&
          assignment.enrollments.some((enrollment) => enrollment.courseId === scope.courseId)
        ) {
          return true;
        }

        return !scope.learningPathId && !scope.courseId && !scope.levelCode;
      });

      if (!canAccess) {
        throw new ForbiddenException("Teacher cannot access this learning path");
      }
    }
  }
}
