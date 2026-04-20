import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  EnrollmentStatus,
  Prisma,
  QuizAttemptSource,
  QuizKind,
  SimulatorSessionStatus,
  SupportTicketStatus,
} from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";

const scopedEnrollmentInclude = Prisma.validator<Prisma.StudentEnrollmentInclude>()({
  course: {
    select: {
      id: true,
      slug: true,
      titleEs: true,
      titleEn: true,
      technicalAreaId: true,
      isPublished: true,
    },
  },
  progress: true,
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      studentProfile: {
        select: {
          currentLevel: true,
          cohort: true,
        },
      },
      institutions: {
        select: {
          institutionId: true,
          campusId: true,
          laboratoryId: true,
        },
      },
    },
  },
  learningPathAssignment: {
    select: {
      learningPathId: true,
      assignedLevelCode: true,
      learningPath: {
        select: {
          id: true,
          titleEs: true,
          titleEn: true,
        },
      },
    },
  },
  practiceAttempts: {
    select: {
      id: true,
      status: true,
      score: true,
      submittedAt: true,
    },
  },
  simulatorSessions: {
    select: {
      id: true,
      status: true,
      score: true,
      startedAt: true,
      finishedAt: true,
    },
  },
});

type ScopedEnrollment = Prisma.StudentEnrollmentGetPayload<{
  include: typeof scopedEnrollmentInclude;
}>;

type TeacherScope = {
  scopeType: string;
  institutionId: string | null;
  campusId: string | null;
  laboratoryId: string | null;
  technicalAreaId: string | null;
  courseId: string | null;
  learningPathId: string | null;
  levelCode: string | null;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
};

function getEnrollmentProgressPct(enrollment: {
  progress: Array<{ progressPct: number }>;
}) {
  return enrollment.progress[0]?.progressPct ?? 0;
}

function getAverageScore(items: Array<{ score: number | null }>) {
  const scoredItems = items.filter(
    (item): item is { score: number } => item.score !== null,
  );

  if (!scoredItems.length) {
    return null;
  }

  return (
    scoredItems.reduce((sum, item) => sum + item.score, 0) / scoredItems.length
  );
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async adminSummary(user: JwtPayload) {
    const institutionId = user.institutionId;
    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      activeMemberships,
      activeStudents,
      activeTeachers,
      publishedCourses,
      learningPaths,
      activeEnrollments,
      openSupportTickets,
      activeSessions,
      progress,
      expiringMemberships,
      completedSimulatorSessions,
    ] = await Promise.all([
      this.prisma.userInstitution.count({
        where: {
          institutionId,
          membershipStatus: "ACTIVE",
        },
      }),
      this.prisma.userInstitution.count({
        where: {
          institutionId,
          membershipStatus: "ACTIVE",
          user: {
            roles: {
              some: {
                role: {
                  name: "STUDENT",
                },
              },
            },
          },
        },
      }),
      this.prisma.userInstitution.count({
        where: {
          institutionId,
          membershipStatus: "ACTIVE",
          user: {
            roles: {
              some: {
                role: {
                  name: "TEACHER",
                },
              },
            },
          },
        },
      }),
      this.prisma.course.count({
        where: {
          isPublished: true,
        },
      }),
      this.prisma.learningPath.count(),
      this.prisma.studentEnrollment.count({
        where: {
          institutionId,
          status: EnrollmentStatus.ACTIVE,
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          requester: {
            institutions: {
              some: {
                institutionId,
              },
            },
          },
          status: {
            in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS],
          },
        },
      }),
      this.prisma.accessSession.count({
        where: {
          status: "ACTIVE",
          institutionMember: {
            institutionId,
          },
        },
      }),
      this.prisma.studentProgress.aggregate({
        where: {
          enrollment: {
            institutionId,
          },
        },
        _avg: {
          progressPct: true,
        },
      }),
      this.prisma.userInstitution.count({
        where: {
          institutionId,
          membershipStatus: "ACTIVE",
          accessEndAt: {
            gte: now,
            lte: next30Days,
          },
        },
      }),
      this.prisma.simulatorSession.count({
        where: {
          enrollment: {
            institutionId,
          },
          status: SimulatorSessionStatus.COMPLETED,
        },
      }),
    ]);

    return {
      institutionId,
      activeMemberships,
      activeStudents,
      activeTeachers,
      publishedCourses,
      learningPaths,
      activeEnrollments,
      openSupportTickets,
      activeSessions,
      expiringMemberships,
      completedSimulatorSessions,
      averageProgress: progress._avg.progressPct ?? 0,
    };
  }

  async teacherSummary(user: JwtPayload) {
    const enrollments = await this.getScopedTeacherEnrollments(user);

    const uniqueStudents = new Set(enrollments.map((item) => item.studentId)).size;
    const uniqueCourses = new Set(enrollments.map((item) => item.courseId)).size;
    const averageProgress =
      enrollments.reduce((sum, item) => sum + getEnrollmentProgressPct(item), 0) /
      (enrollments.length || 1);
    const lowProgressStudents = new Set(
      enrollments
        .filter((item) => getEnrollmentProgressPct(item) < 50)
        .map((item) => item.studentId),
    ).size;
    const pendingPracticeReviews = enrollments.reduce(
      (sum, item) =>
        sum +
        item.practiceAttempts.filter((attempt) => attempt.status === "SUBMITTED").length,
      0,
    );
    const completedSimulatorSessions = enrollments.reduce(
      (sum, item) =>
        sum +
        item.simulatorSessions.filter(
          (session) => session.status === SimulatorSessionStatus.COMPLETED,
        ).length,
      0,
    );

    const courseBreakdown = Array.from(
      enrollments.reduce((map, enrollment) => {
        const current = map.get(enrollment.courseId) ?? {
          courseId: enrollment.course.id,
          titleEs: enrollment.course.titleEs,
          titleEn: enrollment.course.titleEn,
          students: 0,
          averageProgress: 0,
          totalProgress: 0,
        };

        current.students += 1;
        current.totalProgress += getEnrollmentProgressPct(enrollment);
        map.set(enrollment.courseId, current);
        return map;
      }, new Map<string, { courseId: string; titleEs: string; titleEn: string | null; students: number; averageProgress: number; totalProgress: number }>()),
    )
      .map(([, item]) => ({
        courseId: item.courseId,
        titleEs: item.titleEs,
        titleEn: item.titleEn,
        students: item.students,
        averageProgress: item.totalProgress / item.students,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);

    const failedQuizAttemptsWithoutRetake = await this.prisma.quizAttempt.count({
      where: {
        userId: {
          in: Array.from(new Set(enrollments.map((item) => item.studentId))),
        },
        isPassed: false,
        overrideGrantId: null,
        quiz: {
          OR: [
            {
              courseId: {
                in: Array.from(new Set(enrollments.map((item) => item.courseId))),
              },
            },
            {
              module: {
                courseId: {
                  in: Array.from(new Set(enrollments.map((item) => item.courseId))),
                },
              },
            },
          ],
        },
      },
    });

    return {
      institutionId: user.institutionId,
      trackedStudents: uniqueStudents,
      trackedCourses: uniqueCourses,
      enrollments: enrollments.length,
      averageProgress,
      lowProgressStudents,
      pendingPracticeReviews,
      completedSimulatorSessions,
      failedQuizAttemptsWithoutRetake,
      courseBreakdown,
    };
  }

  async studentSummary(user: JwtPayload) {
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
        studentId: user.sub,
      },
      include: {
        course: {
          select: {
            id: true,
            titleEs: true,
            titleEn: true,
          },
        },
        progress: true,
        learningPathAssignment: {
          select: {
            assignedLevelCode: true,
            learningPath: {
              select: {
                id: true,
                titleEs: true,
                titleEn: true,
              },
            },
          },
        },
        simulatorSessions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const unreadNotifications = await this.prisma.notification.count({
      where: {
        userId: user.sub,
        isRead: false,
      },
    });

    const completedSimulatorSessions = enrollments.reduce(
      (sum, item) =>
        sum +
        item.simulatorSessions.filter(
          (session) => session.status === SimulatorSessionStatus.COMPLETED,
        ).length,
      0,
    );

    const averageProgress =
      enrollments.reduce((sum, item) => sum + getEnrollmentProgressPct(item), 0) /
      (enrollments.length || 1);

    return {
      studentId: user.sub,
      institutionId: user.institutionId,
      enrollments: enrollments.length,
      averageProgress,
      unreadNotifications,
      completedSimulatorSessions,
      currentCourses: enrollments.map((item) => ({
        enrollmentId: item.id,
        courseId: item.course.id,
        titleEs: item.course.titleEs,
        titleEn: item.course.titleEn,
        progressPct: getEnrollmentProgressPct(item),
        assignedLevelCode:
          item.assignedLevelCode ?? item.learningPathAssignment?.assignedLevelCode ?? null,
        learningPath: item.learningPathAssignment?.learningPath ?? null,
        status: item.status,
      })),
    };
  }

  async courseSummary(courseId: string, user: JwtPayload) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        technicalArea: {
          select: {
            id: true,
            nameEs: true,
            nameEn: true,
          },
        },
        modules: {
          select: {
            id: true,
            titleEs: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    if (user.roles.includes("TEACHER") && !user.roles.includes("ADMIN")) {
      const enrollments = await this.getScopedTeacherEnrollments(user);
      const canAccess = enrollments.some((item) => item.courseId === courseId);

      if (!canAccess) {
        throw new ForbiddenException("Teacher cannot access this course report");
      }
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
        courseId,
      },
      include: scopedEnrollmentInclude,
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const filteredEnrollments =
      user.roles.includes("TEACHER") && !user.roles.includes("ADMIN")
        ? this.filterEnrollmentsByTeacherScopes(
            enrollments,
            await this.getActiveTeacherScopes(user.sub, user.institutionId),
            user.institutionId,
          )
        : enrollments;

    const quizStats = await this.prisma.quizAttempt.findMany({
      where: {
        quiz: {
          OR: [
            {
              courseId,
            },
            {
              module: {
                courseId,
              },
            },
          ],
        },
        userId: {
          in: filteredEnrollments.map((item) => item.studentId),
        },
      },
      select: {
        id: true,
        isPassed: true,
        attemptSource: true,
        quiz: {
          select: {
            kind: true,
          },
        },
      },
    });

    return {
      course: {
        id: course.id,
        titleEs: course.titleEs,
        titleEn: course.titleEn,
        technicalArea: course.technicalArea,
        modules: course.modules,
      },
      totals: {
        enrollments: filteredEnrollments.length,
        activeEnrollments: filteredEnrollments.filter(
          (item) => item.status === EnrollmentStatus.ACTIVE,
        ).length,
        completedEnrollments: filteredEnrollments.filter(
          (item) => item.status === EnrollmentStatus.COMPLETED,
        ).length,
        averageProgress:
          filteredEnrollments.reduce(
            (sum, item) => sum + getEnrollmentProgressPct(item),
            0,
          ) / (filteredEnrollments.length || 1),
        completedSimulatorSessions: filteredEnrollments.reduce(
          (sum, item) =>
            sum +
            item.simulatorSessions.filter(
              (session) => session.status === SimulatorSessionStatus.COMPLETED,
            ).length,
          0,
        ),
        submittedPracticeAttempts: filteredEnrollments.reduce(
          (sum, item) =>
            sum +
            item.practiceAttempts.filter((attempt) => attempt.status === "SUBMITTED").length,
          0,
        ),
        passedQuizzes: quizStats.filter((item) => item.isPassed).length,
        retakeAttempts: quizStats.filter(
          (item) => item.attemptSource === QuizAttemptSource.RETAKE_OVERRIDE,
        ).length,
        preCourseAttempts: quizStats.filter(
          (item) => item.quiz.kind === QuizKind.PRE_COURSE,
        ).length,
        postCourseAttempts: quizStats.filter(
          (item) => item.quiz.kind === QuizKind.POST_COURSE,
        ).length,
      },
      studentBreakdown: filteredEnrollments.slice(0, 25).map((item) => ({
        studentId: item.student.id,
        studentName: `${item.student.firstName} ${item.student.lastName}`,
        email: item.student.email,
        progressPct: getEnrollmentProgressPct(item),
        assignedLevelCode:
          item.assignedLevelCode ??
          item.learningPathAssignment?.assignedLevelCode ??
          item.student.studentProfile?.currentLevel ??
          null,
        learningPath: item.learningPathAssignment?.learningPath ?? null,
        simulatorSessionsCompleted: item.simulatorSessions.filter(
          (session) => session.status === SimulatorSessionStatus.COMPLETED,
        ).length,
        submittedPracticeAttempts: item.practiceAttempts.filter(
          (attempt) => attempt.status === "SUBMITTED",
        ).length,
      })),
    };
  }

  async studentReportSummary(studentId: string, user: JwtPayload) {
    if (user.roles.includes("STUDENT") && user.sub !== studentId) {
      throw new ForbiddenException("Students can only access their own summary");
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
        studentId,
      },
      include: scopedEnrollmentInclude,
      orderBy: {
        enrolledAt: "desc",
      },
    });

    if (!enrollments.length) {
      throw new NotFoundException("Student enrollments not found");
    }

    const filteredEnrollments =
      user.roles.includes("TEACHER") && !user.roles.includes("ADMIN")
        ? this.filterEnrollmentsByTeacherScopes(
            enrollments,
            await this.getActiveTeacherScopes(user.sub, user.institutionId),
            user.institutionId,
          )
        : enrollments;

    if (!filteredEnrollments.length) {
      throw new ForbiddenException("User cannot access this student report");
    }

    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: {
        userId: studentId,
        quiz: {
          OR: filteredEnrollments.map((item) => ({
            courseId: item.courseId,
          })),
        },
      },
      select: {
        id: true,
        isPassed: true,
        quiz: {
          select: {
            kind: true,
          },
        },
      },
    });

    return {
      student: {
        id: filteredEnrollments[0].student.id,
        name: `${filteredEnrollments[0].student.firstName} ${filteredEnrollments[0].student.lastName}`,
        email: filteredEnrollments[0].student.email,
        currentLevel: filteredEnrollments[0].student.studentProfile?.currentLevel ?? null,
        cohort: filteredEnrollments[0].student.studentProfile?.cohort ?? null,
      },
      institutionId: user.institutionId,
      totals: {
        enrollments: filteredEnrollments.length,
        averageProgress:
          filteredEnrollments.reduce(
            (sum, item) => sum + getEnrollmentProgressPct(item),
            0,
          ) / (filteredEnrollments.length || 1),
        quizzesPassed: quizAttempts.filter((item) => item.isPassed).length,
        preCourseAttempts: quizAttempts.filter(
          (item) => item.quiz.kind === QuizKind.PRE_COURSE,
        ).length,
        postCourseAttempts: quizAttempts.filter(
          (item) => item.quiz.kind === QuizKind.POST_COURSE,
        ).length,
        practiceAttempts: filteredEnrollments.reduce(
          (sum, item) => sum + item.practiceAttempts.length,
          0,
        ),
        completedSimulatorSessions: filteredEnrollments.reduce(
          (sum, item) =>
            sum +
            item.simulatorSessions.filter(
              (session) => session.status === SimulatorSessionStatus.COMPLETED,
            ).length,
          0,
        ),
      },
      enrollments: filteredEnrollments.map((item) => ({
        enrollmentId: item.id,
        courseId: item.course.id,
        courseTitleEs: item.course.titleEs,
        courseTitleEn: item.course.titleEn,
        progressPct: getEnrollmentProgressPct(item),
        status: item.status,
        assignedLevelCode:
          item.assignedLevelCode ??
          item.learningPathAssignment?.assignedLevelCode ??
          item.student.studentProfile?.currentLevel ??
          null,
        learningPath: item.learningPathAssignment?.learningPath ?? null,
        practiceAttempts: item.practiceAttempts.length,
        simulatorSessions: item.simulatorSessions.length,
      })),
    };
  }

  async enrollmentResult(enrollmentId: string, user: JwtPayload) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: {
        id: enrollmentId,
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            titleEs: true,
            titleEn: true,
            lessonWeight: true,
            practiceWeight: true,
            evaluationWeight: true,
            simulatorWeight: true,
            technicalArea: {
              select: {
                id: true,
                nameEs: true,
                nameEn: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            studentProfile: {
              select: {
                currentLevel: true,
                cohort: true,
              },
            },
          },
        },
        learningPathAssignment: {
          select: {
            id: true,
            learningPathId: true,
            assignedLevelCode: true,
            learningPath: {
              select: {
                id: true,
                titleEs: true,
                titleEn: true,
              },
            },
          },
        },
        progress: true,
      },
    });

    if (!enrollment || enrollment.institutionId !== user.institutionId) {
      throw new NotFoundException("Enrollment not found");
    }

    await this.assertEnrollmentAccess(user, enrollment.id, enrollment.studentId);

    return this.buildEnrollmentResult(enrollment.id);
  }

  async learningPathResult(assignmentId: string, user: JwtPayload) {
    const assignment = await this.prisma.studentLearningPathAssignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            studentProfile: {
              select: {
                currentLevel: true,
                cohort: true,
              },
            },
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
          select: {
            id: true,
            studentId: true,
          },
        },
      },
    });

    if (!assignment || assignment.institutionId !== user.institutionId) {
      throw new NotFoundException("Learning path assignment not found");
    }

    if (user.roles.includes("STUDENT") && user.sub !== assignment.studentId) {
      throw new ForbiddenException("Students can only access their own learning path result");
    }

    if (user.roles.includes("TEACHER") && !user.roles.includes("ADMIN")) {
      const scopes = await this.getActiveTeacherScopes(user.sub, user.institutionId);
      const scopedEnrollmentIds = new Set(
        this.filterEnrollmentsByTeacherScopes(
          await this.prisma.studentEnrollment.findMany({
            where: {
              id: {
                in: assignment.enrollments.map((item) => item.id),
              },
            },
            include: scopedEnrollmentInclude,
          }),
          scopes,
          user.institutionId,
        ).map((item) => item.id),
      );

      if (!assignment.enrollments.some((item) => scopedEnrollmentIds.has(item.id))) {
        throw new ForbiddenException("Teacher cannot access this learning path result");
      }
    }

    const enrollmentResults = await Promise.all(
      assignment.enrollments.map((enrollment) =>
        this.buildEnrollmentResult(enrollment.id),
      ),
    );

    const requiredCourseIds = assignment.learningPath.courses
      .filter((item) => item.isRequired)
      .map((item) => item.courseId);
    const coveredRequiredCourses = enrollmentResults.filter((result) =>
      requiredCourseIds.includes(result.enrollment.course.id),
    );
    const passedRequiredCourses = coveredRequiredCourses.filter((result) =>
      ["PASSED", "COMPLETED"].includes(result.consolidatedResult.resultStatus),
    );
    const averageProgress =
      enrollmentResults.reduce(
        (sum, result) => sum + result.consolidatedResult.progress.progressPct,
        0,
      ) / (enrollmentResults.length || 1);
    const averageFinalScore = getAverageScore(
      enrollmentResults
        .map((result) => ({
          score: result.consolidatedResult.finalDecision.finalScore,
        }))
        .filter((item) => item.score !== null),
    );

    const certificationTracks = await this.prisma.certificationTrack.findMany({
      where: {
        courses: {
          some: {
            courseId: {
              in: assignment.learningPath.courses.map((item) => item.courseId),
            },
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        issuer: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const resultStatus =
      requiredCourseIds.length > 0 &&
      passedRequiredCourses.length === requiredCourseIds.length
        ? "PASSED"
        : averageProgress > 0
          ? "IN_PROGRESS"
          : "NOT_STARTED";

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
          courses: assignment.learningPath.courses.map((item) => ({
            courseId: item.course.id,
            slug: item.course.slug,
            titleEs: item.course.titleEs,
            titleEn: item.course.titleEn,
            sortOrder: item.sortOrder,
            isRequired: item.isRequired,
          })),
        },
      },
      consolidatedResult: {
        resultStatus,
        totals: {
          totalCourses: assignment.learningPath.courses.length,
          requiredCourses: requiredCourseIds.length,
          passedRequiredCourses: passedRequiredCourses.length,
          averageProgress: Number(averageProgress.toFixed(2)),
          averageFinalScore:
            averageFinalScore === null ? null : Number(averageFinalScore.toFixed(2)),
        },
        certifications: certificationTracks,
        enrollments: enrollmentResults,
      },
    };
  }

  private async getScopedTeacherEnrollments(user: JwtPayload) {
    const scopes = await this.getActiveTeacherScopes(user.sub, user.institutionId);
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: scopedEnrollmentInclude,
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return this.filterEnrollmentsByTeacherScopes(enrollments, scopes, user.institutionId);
  }

  private async getActiveTeacherScopes(teacherUserId: string, institutionId: string) {
    const now = new Date();

    return this.prisma.teacherScopeAssignment.findMany({
      where: {
        teacherUserId,
        AND: [
          {
            OR: [{ institutionId: null }, { institutionId }],
          },
          {
            effectiveFrom: {
              lte: now,
            },
          },
          {
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }],
          },
        ],
      },
      select: {
        scopeType: true,
        institutionId: true,
        campusId: true,
        laboratoryId: true,
        technicalAreaId: true,
        courseId: true,
        learningPathId: true,
        levelCode: true,
        effectiveFrom: true,
        effectiveUntil: true,
      },
    });
  }

  private filterEnrollmentsByTeacherScopes(
    enrollments: ScopedEnrollment[],
    scopes: TeacherScope[],
    institutionId: string,
  ) {
    if (!scopes.length) {
      return [];
    }

    return enrollments.filter((enrollment) =>
      scopes.some((scope) =>
        this.matchesTeacherScope(enrollment, scope, institutionId),
      ),
    );
  }

  private matchesTeacherScope(
    enrollment: ScopedEnrollment,
    scope: TeacherScope,
    institutionId: string,
  ) {
    const membership = enrollment.student.institutions.find(
      (item) => item.institutionId === institutionId,
    );
    const effectiveLevel =
      enrollment.assignedLevelCode ??
      enrollment.learningPathAssignment?.assignedLevelCode ??
      enrollment.student.studentProfile?.currentLevel ??
      null;

    switch (scope.scopeType) {
      case "GLOBAL":
        return true;
      case "INSTITUTION":
        return enrollment.institutionId === (scope.institutionId ?? institutionId);
      case "CAMPUS":
        return membership?.campusId === scope.campusId;
      case "LABORATORY":
        return membership?.laboratoryId === scope.laboratoryId;
      case "TECHNICAL_AREA":
        return enrollment.course.technicalAreaId === scope.technicalAreaId;
      case "COURSE":
        return enrollment.courseId === scope.courseId;
      case "LEARNING_PATH":
        return enrollment.learningPathAssignment?.learningPathId === scope.learningPathId;
      case "LEVEL":
        return effectiveLevel === scope.levelCode;
      default:
        return false;
    }
  }

  private async assertEnrollmentAccess(
    user: JwtPayload,
    enrollmentId: string,
    studentId: string,
  ) {
    if (user.roles.includes("ADMIN") || user.roles.includes("SUPPORT")) {
      return;
    }

    if (user.roles.includes("STUDENT")) {
      if (user.sub !== studentId) {
        throw new ForbiddenException("Students can only access their own enrollment result");
      }

      return;
    }

    if (user.roles.includes("TEACHER")) {
      const enrollments = await this.getScopedTeacherEnrollments(user);
      const canAccess = enrollments.some((item) => item.id === enrollmentId);

      if (!canAccess) {
        throw new ForbiddenException("Teacher cannot access this enrollment result");
      }
    }
  }

  private async buildEnrollmentResult(enrollmentId: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: {
        id: enrollmentId,
      },
      include: {
        course: {
          include: {
            technicalArea: {
              select: {
                id: true,
                nameEs: true,
                nameEn: true,
              },
            },
            modules: {
              select: {
                id: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            studentProfile: {
              select: {
                currentLevel: true,
                cohort: true,
              },
            },
          },
        },
        learningPathAssignment: {
          select: {
            id: true,
            learningPathId: true,
            assignedLevelCode: true,
            learningPath: {
              select: {
                id: true,
                titleEs: true,
                titleEn: true,
              },
            },
          },
        },
        progress: true,
        lessonProgress: {
          where: {
            completedAt: {
              not: null,
            },
          },
          select: {
            id: true,
          },
        },
        lessonSegmentProgress: {
          where: {
            completedAt: {
              not: null,
            },
          },
          select: {
            id: true,
          },
        },
        practiceAttempts: {
          select: {
            id: true,
            status: true,
            score: true,
            submittedAt: true,
          },
          orderBy: {
            submittedAt: "desc",
          },
        },
        simulatorSessions: {
          select: {
            id: true,
            status: true,
            score: true,
            startedAt: true,
            finishedAt: true,
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    const moduleIds = enrollment.course.modules.map((module) => module.id);
    const [totalLessons, totalSegments, totalPractices, courseQuizzes, quizAttempts] =
      await Promise.all([
        this.prisma.lesson.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        }),
        this.prisma.lessonSegment.count({
          where: {
            lesson: {
              module: {
                courseId: enrollment.courseId,
              },
            },
          },
        }),
        this.prisma.practice.count({
          where: {
            lesson: {
              module: {
                courseId: enrollment.courseId,
              },
            },
          },
        }),
        this.prisma.quiz.findMany({
          where: {
            OR: [
              {
                courseId: enrollment.courseId,
              },
              {
                moduleId: {
                  in: moduleIds,
                },
              },
            ],
          },
          select: {
            id: true,
            kind: true,
            moduleId: true,
            passingScore: true,
          },
        }),
        this.prisma.quizAttempt.findMany({
          where: {
            userId: enrollment.studentId,
            quiz: {
              OR: [
                {
                  courseId: enrollment.courseId,
                },
                {
                  moduleId: {
                    in: moduleIds,
                  },
                },
              ],
            },
          },
          select: {
            id: true,
            score: true,
            isPassed: true,
            startedAt: true,
            submittedAt: true,
            attemptNumber: true,
            attemptSource: true,
            quiz: {
              select: {
                id: true,
                kind: true,
                moduleId: true,
              },
            },
          },
          orderBy: {
            submittedAt: "desc",
          },
        }),
      ]);

    const latestAttemptByQuizKind = (kind: QuizKind) =>
      quizAttempts.find((attempt) => attempt.quiz.kind === kind) ?? null;
    const preCourseLatest = latestAttemptByQuizKind(QuizKind.PRE_COURSE);
    const postCourseLatest = latestAttemptByQuizKind(QuizKind.POST_COURSE);
    const preModuleAttempts = quizAttempts.filter(
      (attempt) => attempt.quiz.kind === QuizKind.PRE_MODULE,
    );
    const practiceCheckAttempts = quizAttempts.filter(
      (attempt) => attempt.quiz.kind === QuizKind.PRACTICE_CHECK,
    );
    const passedPracticeAttempts = enrollment.practiceAttempts.filter(
      (attempt) => attempt.status === "PASSED",
    );
    const completedSimulatorSessions = enrollment.simulatorSessions.filter(
      (session) => session.status === SimulatorSessionStatus.COMPLETED,
    );
    const progress = enrollment.progress[0];
    const progressPct = progress?.progressPct ?? 0;

    let resultStatus = "NOT_STARTED";

    if (postCourseLatest?.isPassed) {
      resultStatus = "PASSED";
    } else if (postCourseLatest && postCourseLatest.isPassed === false) {
      resultStatus = "FAILED";
    } else if (
      enrollment.status === EnrollmentStatus.COMPLETED ||
      progressPct >= 100
    ) {
      resultStatus = "COMPLETED";
    } else if (progressPct > 0) {
      resultStatus = "IN_PROGRESS";
    }

    const finalScore =
      postCourseLatest?.score ??
      (progress ? Number(progress.progressPct.toFixed(2)) : null);

    return {
      enrollment: {
        id: enrollment.id,
        institutionId: enrollment.institutionId,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        assignedLevelCode:
          enrollment.assignedLevelCode ??
          enrollment.learningPathAssignment?.assignedLevelCode ??
          enrollment.student.studentProfile?.currentLevel ??
          null,
        student: {
          id: enrollment.student.id,
          name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          email: enrollment.student.email,
          currentLevel: enrollment.student.studentProfile?.currentLevel ?? null,
          cohort: enrollment.student.studentProfile?.cohort ?? null,
        },
        course: {
          id: enrollment.course.id,
          slug: enrollment.course.slug,
          titleEs: enrollment.course.titleEs,
          titleEn: enrollment.course.titleEn,
          technicalArea: enrollment.course.technicalArea,
        },
        learningPath: enrollment.learningPathAssignment
          ? {
              id: enrollment.learningPathAssignment.learningPath.id,
              titleEs: enrollment.learningPathAssignment.learningPath.titleEs,
              titleEn: enrollment.learningPathAssignment.learningPath.titleEn,
            }
          : null,
      },
      consolidatedResult: {
        resultStatus,
        progress: {
          progressPct: Number(progressPct.toFixed(2)),
          lastActivityAt: progress?.lastActivityAt ?? null,
          lessonsDone: progress?.lessonsDone ?? 0,
          totalLessons,
          segmentsDone: progress?.segmentsDone ?? 0,
          totalSegments,
          practicesDone: progress?.practicesDone ?? 0,
          totalPractices,
          quizzesPassed: progress?.quizzesPassed ?? 0,
          totalQuizzes: courseQuizzes.length,
          simulatorsDone: progress?.simulatorsDone ?? 0,
        },
        evaluations: {
          preCourse: {
            attempts: quizAttempts.filter(
              (attempt) => attempt.quiz.kind === QuizKind.PRE_COURSE,
            ).length,
            latestScore: preCourseLatest?.score ?? null,
            passed: preCourseLatest?.isPassed ?? null,
          },
          preModule: {
            attempts: preModuleAttempts.length,
            passedAttempts: preModuleAttempts.filter((attempt) => attempt.isPassed).length,
          },
          practiceChecks: {
            attempts: practiceCheckAttempts.length,
            passedAttempts: practiceCheckAttempts.filter((attempt) => attempt.isPassed).length,
          },
          postCourse: {
            attempts: quizAttempts.filter(
              (attempt) => attempt.quiz.kind === QuizKind.POST_COURSE,
            ).length,
            latestScore: postCourseLatest?.score ?? null,
            passed: postCourseLatest?.isPassed ?? null,
          },
        },
        practices: {
          attempts: enrollment.practiceAttempts.length,
          passed: passedPracticeAttempts.length,
          failed: enrollment.practiceAttempts.filter(
            (attempt) => attempt.status === "FAILED",
          ).length,
          pendingReview: enrollment.practiceAttempts.filter(
            (attempt) => attempt.status === "SUBMITTED",
          ).length,
          averageScore: getAverageScore(enrollment.practiceAttempts),
        },
        simulators: {
          sessions: enrollment.simulatorSessions.length,
          completed: completedSimulatorSessions.length,
          averageScore: getAverageScore(completedSimulatorSessions),
        },
        finalDecision: {
          finalScore,
          basedOn: postCourseLatest ? "POST_COURSE" : "PLATFORM_PROGRESS",
          isPassed: resultStatus === "PASSED",
        },
      },
    };
  }
}
