import { Injectable, NotFoundException } from "@nestjs/common";
import { PracticeAttemptStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CompleteLessonDto } from "./dto/complete-lesson.dto";
import { CompletePracticeDto } from "./dto/complete-practice.dto";
import { CompleteSegmentDto } from "./dto/complete-segment.dto";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.studentProgress.findMany({
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            course: true,
            institution: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async completeLesson(dto: CompleteLessonDto) {
    await this.ensureEnrollmentExists(dto.enrollmentId);

    const lessonProgress = await this.prisma.lessonProgress.upsert({
      where: {
        lessonId_enrollmentId: {
          lessonId: dto.lessonId,
          enrollmentId: dto.enrollmentId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        lessonId: dto.lessonId,
        enrollmentId: dto.enrollmentId,
        completedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "LESSON_COMPLETED",
        entityType: "LessonProgress",
        entityId: lessonProgress.id,
        meta: {
          enrollmentId: dto.enrollmentId,
          lessonId: dto.lessonId,
        },
      },
    });

    return this.recalculateProgress(dto.enrollmentId);
  }

  async completeSegment(dto: CompleteSegmentDto) {
    await this.ensureEnrollmentExists(dto.enrollmentId);

    const segmentProgress = await this.prisma.lessonSegmentProgress.upsert({
      where: {
        lessonSegmentId_enrollmentId: {
          lessonSegmentId: dto.lessonSegmentId,
          enrollmentId: dto.enrollmentId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        lessonSegmentId: dto.lessonSegmentId,
        enrollmentId: dto.enrollmentId,
        completedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "SEGMENT_COMPLETED",
        entityType: "LessonSegmentProgress",
        entityId: segmentProgress.id,
        meta: {
          enrollmentId: dto.enrollmentId,
          lessonSegmentId: dto.lessonSegmentId,
        },
      },
    });

    return this.recalculateProgress(dto.enrollmentId);
  }

  async completePractice(dto: CompletePracticeDto) {
    await this.ensureEnrollmentExists(dto.enrollmentId);

    const attempt = await this.prisma.practiceAttempt.create({
      data: {
        practiceId: dto.practiceId,
        enrollmentId: dto.enrollmentId,
        studentId: dto.studentId,
        notes: dto.notes,
        score: dto.score,
        status:
          dto.score === undefined
            ? PracticeAttemptStatus.SUBMITTED
            : dto.score >= 70
              ? PracticeAttemptStatus.PASSED
              : PracticeAttemptStatus.FAILED,
      },
    });

    await this.prisma.skillEvidence.create({
      data: {
        practiceId: dto.practiceId,
        studentId: dto.studentId,
        notes: dto.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: dto.studentId,
        action: "PRACTICE_COMPLETED",
        entityType: "PracticeAttempt",
        entityId: attempt.id,
        meta: {
          enrollmentId: dto.enrollmentId,
          practiceId: dto.practiceId,
          score: dto.score,
          status: attempt.status,
        },
      },
    });

    return this.recalculateProgress(dto.enrollmentId);
  }

  async findStudentSummary(studentId: string) {
    return this.prisma.studentEnrollment.findMany({
      where: {
        studentId,
      },
      include: {
        course: true,
        progress: true,
        learningPathAssignment: {
          include: {
            learningPath: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  async findStudentDetail(studentId: string) {
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        studentId,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    segments: true,
                    practices: {
                      include: {
                        simulatorMappings: true,
                      },
                    },
                  },
                },
                quizzes: true,
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
            quizzes: true,
          },
        },
        progress: true,
        learningPathAssignment: {
          include: {
            learningPath: true,
          },
        },
        lessonProgress: true,
        lessonSegmentProgress: true,
        practiceAttempts: true,
        simulatorSessions: {
          include: {
            simulator: true,
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: {
        userId: studentId,
      },
      include: {
        quiz: {
          include: {
            module: true,
            course: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return enrollments.map((enrollment) => {
      const modules = enrollment.course.modules;
      const lessons = modules.flatMap((module) => module.lessons);
      const segments = lessons.flatMap((lesson) => lesson.segments);
      const practices = lessons.flatMap((lesson) => lesson.practices);
      const courseQuizzes = enrollment.course.quizzes;
      const simulatorTargets = practices.filter(
        (practice) =>
          practice.requiresSimulator || practice.simulatorMappings.length > 0,
      );

      const completedLessonIds = new Set(
        enrollment.lessonProgress
          .filter((item) => item.completedAt)
          .map((item) => item.lessonId),
      );
      const completedSegmentIds = new Set(
        enrollment.lessonSegmentProgress
          .filter((item) => item.completedAt)
          .map((item) => item.lessonSegmentId),
      );
      const passedPracticeIds = new Set(
        enrollment.practiceAttempts
          .filter((item) => item.status === PracticeAttemptStatus.PASSED)
          .map((item) => item.practiceId),
      );
      const quizAttemptsForCourse = quizAttempts.filter((attempt) => {
        if (attempt.quiz.courseId) {
          return attempt.quiz.courseId === enrollment.courseId;
        }

        return attempt.quiz.module?.courseId === enrollment.courseId;
      });

      const passedCourseQuizIds = new Set(
        quizAttemptsForCourse
          .filter((attempt) => attempt.isPassed)
          .map((attempt) => attempt.quizId),
      );

      const moduleSummaries = modules.map((module) => {
        const moduleLessons = module.lessons;
        const moduleSegments = moduleLessons.flatMap((lesson) => lesson.segments);
        const modulePractices = moduleLessons.flatMap((lesson) => lesson.practices);
        const moduleQuizzes = module.quizzes;

        const lessonsCompleted = moduleLessons.filter((lesson) =>
          completedLessonIds.has(lesson.id),
        ).length;
        const segmentsCompleted = moduleSegments.filter((segment) =>
          completedSegmentIds.has(segment.id),
        ).length;
        const practicesCompleted = modulePractices.filter((practice) =>
          passedPracticeIds.has(practice.id),
        ).length;
        const quizzesCompleted = moduleQuizzes.filter((quiz) =>
          passedCourseQuizIds.has(quiz.id),
        ).length;

        return {
          id: module.id,
          titleEs: module.titleEs,
          titleEn: module.titleEn,
          lessonsTotal: moduleLessons.length,
          lessonsCompleted,
          segmentsTotal: moduleSegments.length,
          segmentsCompleted,
          practicesTotal: modulePractices.length,
          practicesCompleted,
          quizzesTotal: moduleQuizzes.length,
          quizzesCompleted,
        };
      });

      const recentActivity = [
        ...enrollment.lessonProgress
          .filter((item) => item.completedAt)
          .map((item) => {
            const lesson = lessons.find((entry) => entry.id === item.lessonId);
            return {
              id: item.id,
              type: "LESSON",
              title: lesson?.titleEs ?? "Leccion completada",
              happenedAt: item.completedAt,
              context: lesson?.moduleId
                ? modules.find((module) => module.id === lesson.moduleId)?.titleEs
                : null,
            };
          }),
        ...enrollment.lessonSegmentProgress
          .filter((item) => item.completedAt)
          .map((item) => {
            const segment = segments.find((entry) => entry.id === item.lessonSegmentId);
            const lesson = lessons.find((entry) => entry.id === segment?.lessonId);
            return {
              id: item.id,
              type: "SEGMENT",
              title: segment?.titleEs ?? "Contenido completado",
              happenedAt: item.completedAt,
              context: lesson?.titleEs ?? null,
            };
          }),
        ...enrollment.practiceAttempts.map((item) => {
          const practice = practices.find((entry) => entry.id === item.practiceId);
          return {
            id: item.id,
            type: "PRACTICE",
            title: practice?.titleEs ?? "Practica registrada",
            happenedAt: item.submittedAt,
            context:
              item.status === PracticeAttemptStatus.PASSED
                ? "Completada"
                : item.status === PracticeAttemptStatus.FAILED
                  ? "Pendiente de mejora"
                  : "En revision",
          };
        }),
        ...quizAttemptsForCourse
          .filter((item) => item.submittedAt)
          .map((item) => ({
            id: item.id,
            type: "QUIZ",
            title: item.quiz.titleEs,
            happenedAt: item.submittedAt,
            context: item.isPassed ? "Aprobada" : "No aprobada",
          })),
        ...enrollment.simulatorSessions.map((item) => ({
          id: item.id,
          type: "SIMULATOR",
          title: item.simulator.name,
          happenedAt: item.finishedAt ?? item.startedAt,
          context: item.status === "COMPLETED" ? "Sesion completada" : "Sesion iniciada",
        })),
      ]
        .filter((item) => item.happenedAt)
        .sort(
          (a, b) =>
            new Date(b.happenedAt as Date).getTime() -
            new Date(a.happenedAt as Date).getTime(),
        )
        .slice(0, 12);

      return {
        enrollmentId: enrollment.id,
        assignedLevelCode: enrollment.assignedLevelCode,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        course: {
          id: enrollment.course.id,
          titleEs: enrollment.course.titleEs,
          titleEn: enrollment.course.titleEn,
        },
        learningPathAssignment: enrollment.learningPathAssignment
          ? {
              id: enrollment.learningPathAssignment.id,
              learningPath: {
                titleEs: enrollment.learningPathAssignment.learningPath.titleEs,
                titleEn: enrollment.learningPathAssignment.learningPath.titleEn,
              },
            }
          : null,
        progress: enrollment.progress[0] ?? null,
        totals: {
          modules: modules.length,
          lessons: lessons.length,
          segments: segments.length,
          practices: practices.length,
          quizzes: courseQuizzes.length,
          simulatorTargets: simulatorTargets.length,
        },
        componentProgress: {
          lessonsPct:
            lessons.length > 0
              ? Number(((completedLessonIds.size / lessons.length) * 100).toFixed(1))
              : 0,
          segmentsPct:
            segments.length > 0
              ? Number(((completedSegmentIds.size / segments.length) * 100).toFixed(1))
              : 0,
          practicesPct:
            practices.length > 0
              ? Number(((passedPracticeIds.size / practices.length) * 100).toFixed(1))
              : 0,
          quizzesPct:
            courseQuizzes.length > 0
              ? Number(((passedCourseQuizIds.size / courseQuizzes.length) * 100).toFixed(1))
              : 0,
          simulatorsPct:
            simulatorTargets.length > 0
              ? Number(
                  (
                    (Math.min(
                      enrollment.progress[0]?.simulatorsDone ?? 0,
                      simulatorTargets.length,
                    ) /
                      simulatorTargets.length) *
                    100
                  ).toFixed(1),
                )
              : 0,
        },
        moduleSummaries,
        recentActivity,
      };
    });
  }

  async recalculateProgress(enrollmentId: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    segments: true,
                    practices: true,
                  },
                },
              },
            },
            quizzes: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    const lessons = enrollment.course.modules.flatMap((module) => module.lessons);
    const totalLessons = lessons.length;
    const totalSegments = lessons.flatMap((lesson) => lesson.segments).length;
    const totalPractices = lessons.flatMap((lesson) => lesson.practices).length;
    const totalQuizzes = enrollment.course.quizzes.length;

    const [completedLessons, completedSegments, completedPractices, passedQuizzes, completedSimulators] =
      await Promise.all([
        this.prisma.lessonProgress.count({
          where: {
            enrollmentId,
            completedAt: {
              not: null,
            },
          },
        }),
        this.prisma.lessonSegmentProgress.count({
          where: {
            enrollmentId,
            completedAt: {
              not: null,
            },
          },
        }),
        this.prisma.practiceAttempt.count({
          where: {
            enrollmentId,
            status: PracticeAttemptStatus.PASSED,
          },
        }),
        this.prisma.quizAttempt.count({
          where: {
            userId: enrollment.studentId,
            isPassed: true,
            quiz: {
              courseId: enrollment.courseId,
            },
          },
        }),
        this.prisma.simulatorSession.count({
          where: {
            enrollmentId,
            status: "COMPLETED",
          },
        }),
      ]);

    const lessonPct =
      totalLessons > 0 ? (completedLessons / totalLessons) * enrollment.course.lessonWeight : 0;
    const segmentPct =
      totalSegments > 0 ? (completedSegments / totalSegments) * 10 : 0;
    const practicePct =
      totalPractices > 0
        ? (completedPractices / totalPractices) * enrollment.course.practiceWeight
        : 0;
    const quizPct =
      totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * enrollment.course.evaluationWeight : 0;
    const simulatorPct = completedSimulators > 0 ? enrollment.course.simulatorWeight : 0;

    const progressPct = Number(
      Math.min(100, lessonPct + segmentPct + practicePct + quizPct + simulatorPct).toFixed(2),
    );

    return this.prisma.studentProgress.upsert({
      where: {
        enrollmentId,
      },
      update: {
        progressPct,
        lessonsDone: completedLessons,
        segmentsDone: completedSegments,
        practicesDone: completedPractices,
        quizzesPassed: passedQuizzes,
        simulatorsDone: completedSimulators,
        lastActivityAt: new Date(),
      },
      create: {
        enrollmentId,
        progressPct,
        lessonsDone: completedLessons,
        segmentsDone: completedSegments,
        practicesDone: completedPractices,
        quizzesPassed: passedQuizzes,
        simulatorsDone: completedSimulators,
        lastActivityAt: new Date(),
      },
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    });
  }

  private async ensureEnrollmentExists(enrollmentId: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }
  }
}
