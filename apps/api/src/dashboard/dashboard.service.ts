import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async adminSummary() {
    const [
      users,
      institutions,
      courses,
      enrollments,
      quizzes,
      supportTickets,
      progress,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.institution.count(),
      this.prisma.course.count(),
      this.prisma.studentEnrollment.count(),
      this.prisma.quiz.count(),
      this.prisma.supportTicket.count(),
      this.prisma.studentProgress.aggregate({
        _avg: {
          progressPct: true,
        },
      }),
    ]);

    return {
      users,
      institutions,
      courses,
      enrollments,
      quizzes,
      supportTickets,
      averageProgress: progress._avg.progressPct ?? 0,
    };
  }

  async teacherSummary() {
    const [courses, modules, lessons, practices, enrollments, attempts] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.module.count(),
      this.prisma.lesson.count(),
      this.prisma.practice.count(),
      this.prisma.studentEnrollment.count(),
      this.prisma.quizAttempt.count(),
    ]);

    return {
      courses,
      modules,
      lessons,
      practices,
      enrollments,
      quizAttempts: attempts,
    };
  }

  async studentSummary(studentId: string) {
    const [enrollments, attempts, notifications] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where: {
          studentId,
        },
        include: {
          course: true,
          progress: true,
        },
      }),
      this.prisma.quizAttempt.count({
        where: {
          userId: studentId,
        },
      }),
      this.prisma.notification.count({
        where: {
          userId: studentId,
          isRead: false,
        },
      }),
    ]);

    return {
      enrollments,
      quizAttempts: attempts,
      unreadNotifications: notifications,
    };
  }
}
