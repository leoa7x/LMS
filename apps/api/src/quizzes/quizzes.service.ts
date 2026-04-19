import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { SubmitQuizAttemptDto } from "./dto/submit-quiz-attempt.dto";

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.quiz.create({
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

  async submitAttempt(dto: SubmitQuizAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        course: true,
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

    if (previousAttempts >= quiz.maxAttempts) {
      throw new BadRequestException("Max attempts reached");
    }

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

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId: dto.quizId,
        userId: dto.userId,
        score,
        isPassed,
        submittedAt: new Date(),
      },
      include: {
        quiz: true,
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

    if (quiz.courseId && isPassed) {
      await this.prisma.studentEnrollment.findFirst({
        where: {
          courseId: quiz.courseId,
          studentId: dto.userId,
        },
      }).then(async (enrollment) => {
        if (!enrollment) {
          return;
        }

        const passedCount = await this.prisma.quizAttempt.count({
          where: {
            userId: dto.userId,
            isPassed: true,
            quiz: {
              courseId: quiz.courseId,
            },
          },
        });

        await this.prisma.studentProgress.updateMany({
          where: {
            enrollmentId: enrollment.id,
          },
          data: {
            quizzesPassed: passedCount,
          },
        });
      });
    }

    return attempt;
  }
}
