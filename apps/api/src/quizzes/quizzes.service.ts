import { BadRequestException, Injectable } from "@nestjs/common";
import { QuizAttemptSource } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ProgressService } from "../progress/progress.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { GrantQuizRetakeDto } from "./dto/grant-quiz-retake.dto";
import { SubmitQuizAttemptDto } from "./dto/submit-quiz-attempt.dto";

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  findAll() {
    return this.prisma.quiz.findMany({
      include: {
        course: true,
        module: true,
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        attempts: true,
        retakeGrants: true,
      },
      orderBy: {
        titleEs: "asc",
      },
    });
  }

  createQuiz(dto: CreateQuizDto) {
    if (!dto.courseId && !dto.moduleId) {
      throw new BadRequestException("Quiz must belong to a course or module");
    }

    return this.prisma.quiz
      .create({
        data: {
          courseId: dto.courseId,
          moduleId: dto.moduleId,
          titleEs: dto.titleEs,
          titleEn: dto.titleEn,
          kind: dto.kind,
          maxAttempts: dto.maxAttempts ?? 1,
          passingScore: dto.passingScore ?? 70,
        },
        include: {
          course: true,
          module: true,
        },
      })
      .then(async (quiz) => {
        await this.prisma.auditLog.create({
          data: {
            action: "QUIZ_CREATED",
            entityType: "Quiz",
            entityId: quiz.id,
            meta: {
              courseId: dto.courseId,
              moduleId: dto.moduleId,
              kind: dto.kind,
            },
          },
        });

        return quiz;
      });
  }

  createQuestion(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        quizId: dto.quizId,
        promptEs: dto.promptEs,
        promptEn: dto.promptEn,
        sortOrder: dto.sortOrder,
        options: {
          create: dto.options.map((option) => ({
            labelEs: option.labelEs,
            labelEn: option.labelEn,
            isCorrect: option.isCorrect,
          })),
        },
      },
      include: {
        options: true,
      },
    });
  }

  findAttempts() {
    return this.prisma.quizAttempt.findMany({
      include: {
        quiz: true,
        overrideGrant: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  findRetakeGrants() {
    return this.prisma.quizRetakeGrant.findMany({
      include: {
        quiz: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        grantedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: true,
        module: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  grantRetake(dto: GrantQuizRetakeDto) {
    return this.prisma.quizRetakeGrant.create({
      data: {
        quizId: dto.quizId,
        studentId: dto.studentId,
        grantedByUserId: dto.grantedByUserId,
        reason: dto.reason,
        courseId: dto.courseId,
        moduleId: dto.moduleId,
        maxExtraAttempts: dto.maxExtraAttempts ?? 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: {
        quiz: true,
        student: true,
        grantedByUser: true,
      },
    });
  }

  async submitAttempt(dto: SubmitQuizAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new BadRequestException("Quiz not found");
    }

    const previousAttempts = await this.prisma.quizAttempt.count({
      where: {
        quizId: dto.quizId,
        userId: dto.userId,
      },
    });

    const activeGrants = await this.prisma.quizRetakeGrant.findMany({
      where: {
        quizId: dto.quizId,
        studentId: dto.userId,
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gte: new Date(),
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const extraAttempts = activeGrants.reduce(
      (sum, grant) => sum + grant.maxExtraAttempts,
      0,
    );
    const allowedAttempts = quiz.maxAttempts + extraAttempts;

    if (previousAttempts >= allowedAttempts) {
      throw new BadRequestException("Max attempts reached");
    }

    const activeGrant =
      previousAttempts >= quiz.maxAttempts ? activeGrants[0] : undefined;

    const answersByQuestion = new Map(
      dto.answers.map((answer) => [answer.questionId, answer.answerOptionId]),
    );

    let correctCount = 0;

    for (const question of quiz.questions) {
      const correctOption = question.options.find((option) => option.isCorrect);
      const selectedOptionId = answersByQuestion.get(question.id);

      if (correctOption && selectedOptionId === correctOption.id) {
        correctCount += 1;
      }
    }

    const totalQuestions = quiz.questions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = score >= quiz.passingScore;
    const attemptNumber = previousAttempts + 1;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId: dto.quizId,
        userId: dto.userId,
        score,
        isPassed,
        attemptNumber,
        attemptSource: activeGrant
          ? QuizAttemptSource.RETAKE_OVERRIDE
          : QuizAttemptSource.STANDARD,
        overrideGrantId: activeGrant?.id,
        submittedAt: new Date(),
      },
      include: {
        quiz: true,
        overrideGrant: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const impactedEnrollments = await this.resolveImpactedEnrollments(
      dto.userId,
      quiz.courseId,
      quiz.moduleId,
    );

    for (const enrollment of impactedEnrollments) {
      await this.progressService.recalculateProgress(enrollment.id);
    }

    await this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        action: "QUIZ_ATTEMPT_SUBMITTED",
        entityType: "QuizAttempt",
        entityId: attempt.id,
        meta: {
          quizId: dto.quizId,
          score,
          isPassed,
          attemptNumber,
          attemptSource: attempt.attemptSource,
          overrideGrantId: activeGrant?.id,
        },
      },
    });

    return attempt;
  }

  private async resolveImpactedEnrollments(
    studentId: string,
    courseId?: string | null,
    moduleId?: string | null,
  ) {
    if (courseId) {
      return this.prisma.studentEnrollment.findMany({
        where: {
          courseId,
          studentId,
        },
        select: { id: true },
      });
    }

    if (moduleId) {
      const module = await this.prisma.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true },
      });

      if (!module) {
        return [];
      }

      return this.prisma.studentEnrollment.findMany({
        where: {
          courseId: module.courseId,
          studentId,
        },
        select: { id: true },
      });
    }

    return [];
  }
}
