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
