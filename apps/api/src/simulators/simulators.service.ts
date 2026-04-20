import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SimulatorSessionStatus } from "@prisma/client";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSimulatorMappingDto } from "./dto/create-simulator-mapping.dto";
import { CreateSimulatorDto } from "./dto/create-simulator.dto";
import { CreateSimulatorSessionDto } from "./dto/create-simulator-session.dto";
import { CompleteSimulatorSessionDto } from "./dto/complete-simulator-session.dto";
import { LogSimulatorSessionEventDto } from "./dto/log-simulator-session-event.dto";

@Injectable()
export class SimulatorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
  ) {}

  async findAll(user: JwtPayload) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);

    return this.prisma.simulator.findMany({
      where: {
        mappings: {
          some: {
            practice: {
              lesson: {
                module: {
                  courseId: {
                    in: accessibleCourseIds,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        mappings: {
          include: {
            practice: {
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
              },
            },
          },
        },
        sessions: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  create(dto: CreateSimulatorDto) {
    return this.prisma.simulator
      .create({
        data: {
          slug: dto.slug,
          name: dto.name,
          kind: dto.kind,
          launchUrl: dto.launchUrl,
          configJson: dto.configJson as Prisma.InputJsonValue | undefined,
          isTrackable: dto.isTrackable ?? true,
        },
      })
      .then(async (simulator) => {
        await this.prisma.auditLog.create({
          data: {
            action: "SIMULATOR_CREATED",
            entityType: "Simulator",
            entityId: simulator.id,
            meta: {
              slug: dto.slug,
              kind: dto.kind,
            },
          },
        });

        return simulator;
      });
  }

  createMapping(dto: CreateSimulatorMappingDto) {
    return this.prisma.simulatorMapping
      .create({
        data: {
          simulatorId: dto.simulatorId,
          practiceId: dto.practiceId,
        },
        include: {
          simulator: true,
          practice: true,
        },
      })
      .then(async (mapping) => {
        await this.prisma.auditLog.create({
          data: {
            action: "SIMULATOR_MAPPING_CREATED",
            entityType: "SimulatorMapping",
            entityId: mapping.id,
            meta: {
              simulatorId: dto.simulatorId,
              practiceId: dto.practiceId,
            },
          },
        });

        return mapping;
      });
  }

  async findMappings(user: JwtPayload) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);

    return this.prisma.simulatorMapping.findMany({
      where: {
        practice: {
          lesson: {
            module: {
              courseId: {
                in: accessibleCourseIds,
              },
            },
          },
        },
      },
      include: {
        simulator: true,
        practice: {
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
          },
        },
      },
      orderBy: {
        simulatorId: "asc",
      },
    });
  }

  async createSession(dto: CreateSimulatorSessionDto, user: JwtPayload) {
    const context = await this.resolveSessionContext(
      dto.simulatorId,
      dto.enrollmentId,
      dto.studentId,
      user,
    );
    const session = await this.prisma.simulatorSession.create({
      data: {
        simulatorId: dto.simulatorId,
        studentId: dto.studentId,
        enrollmentId: dto.enrollmentId,
      },
      include: {
        simulator: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: dto.studentId,
        action: "SIMULATOR_SESSION_STARTED",
        entityType: "SimulatorSession",
        entityId: session.id,
        meta: {
          simulatorId: dto.simulatorId,
          enrollmentId: dto.enrollmentId,
          practiceIds: context.practiceIds,
          moduleIds: context.moduleIds,
        },
      },
    });

    return {
      ...session,
      context,
    };
  }

  async findSessions(user: JwtPayload) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);

    return this.prisma.simulatorSession.findMany({
      where: user.roles.includes("STUDENT")
        ? {
            studentId: user.sub,
            enrollment: {
              courseId: {
                in: accessibleCourseIds,
              },
            },
          }
        : {
            enrollment: {
              courseId: {
                in: accessibleCourseIds,
              },
            },
          },
      include: {
        simulator: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        enrollment: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  async completeSession(dto: CompleteSimulatorSessionDto, user: JwtPayload) {
    const session = await this.prisma.simulatorSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        simulator: {
          include: {
            mappings: true,
          },
        },
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Simulator session not found");
    }

    await this.assertSessionAccess(session.id, session.studentId, user);

    const isFinalStatus =
      dto.status === SimulatorSessionStatus.COMPLETED ||
      dto.status === SimulatorSessionStatus.FAILED ||
      dto.status === SimulatorSessionStatus.ABANDONED;

    if (!isFinalStatus) {
      throw new BadRequestException("Final simulator session status required");
    }

    const updatedSession = await this.prisma.simulatorSession.update({
      where: { id: dto.sessionId },
      data: {
        status: dto.status,
        score: dto.score,
        finishedAt: new Date(),
      },
      include: {
        simulator: true,
        student: true,
        enrollment: true,
      },
    });

    if (updatedSession.enrollmentId && dto.status === SimulatorSessionStatus.COMPLETED) {
      if (session.simulator.mappings.length) {
        await this.prisma.skillEvidence.createMany({
          data: session.simulator.mappings.map((mapping) => ({
            practiceId: mapping.practiceId,
            studentId: updatedSession.studentId,
            notes: `Simulator ${session.simulator.name} completed${dto.score !== undefined ? ` with score ${dto.score}` : ""}`,
          })),
        });
      }

      const completedSessions = await this.prisma.simulatorSession.count({
        where: {
          enrollmentId: updatedSession.enrollmentId,
          status: SimulatorSessionStatus.COMPLETED,
        },
      });

      const enrollment = await this.prisma.studentEnrollment.findUnique({
        where: {
          id: updatedSession.enrollmentId,
        },
        include: {
          course: true,
        },
      });

        if (enrollment) {
          const progress = await this.prisma.studentProgress.findUnique({
            where: {
              enrollmentId: enrollment.id,
            },
          });

        const totalTrackableSimulatorMappings = await this.prisma.simulatorMapping.count({
          where: {
            practice: {
              lesson: {
                module: {
                  courseId: enrollment.courseId,
                },
              },
            },
          },
        });

        const simulatorPct =
          totalTrackableSimulatorMappings > 0
            ? (completedSessions / totalTrackableSimulatorMappings) *
              enrollment.course.simulatorWeight
            : 0;

        await this.prisma.studentProgress.updateMany({
          where: {
            enrollmentId: enrollment.id,
          },
          data: {
            simulatorsDone: completedSessions,
            progressPct: progress
              ? Number(
                  (
                    Math.min(
                      100,
                      progress.progressPct -
                        Math.min(progress.progressPct, enrollment.course.simulatorWeight) +
                        simulatorPct,
                    )
                  ).toFixed(2),
                )
              : simulatorPct,
          },
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        userId: updatedSession.studentId,
        action: "SIMULATOR_SESSION_COMPLETED",
        entityType: "SimulatorSession",
        entityId: updatedSession.id,
        meta: {
          status: dto.status,
          score: dto.score,
        },
      },
    });

    return updatedSession;
  }

  async getSessionContext(sessionId: string, user: JwtPayload) {
    const session = await this.prisma.simulatorSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        simulator: {
          include: {
            mappings: {
              include: {
                practice: {
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
                  },
                },
              },
            },
          },
        },
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Simulator session not found");
    }

    await this.assertSessionAccess(session.id, session.studentId, user);

    return {
      sessionId: session.id,
      simulator: {
        id: session.simulator.id,
        slug: session.simulator.slug,
        name: session.simulator.name,
        kind: session.simulator.kind,
        launchUrl: session.simulator.launchUrl,
        configJson: session.simulator.configJson,
      },
      enrollment: session.enrollment
        ? {
            id: session.enrollment.id,
            courseId: session.enrollment.courseId,
            courseTitleEs: session.enrollment.course.titleEs,
            courseTitleEn: session.enrollment.course.titleEn,
          }
        : null,
      mappings: session.simulator.mappings.map((mapping) => ({
        practiceId: mapping.practice.id,
        practiceTitleEs: mapping.practice.titleEs,
        practiceTitleEn: mapping.practice.titleEn,
        lessonId: mapping.practice.lesson.id,
        lessonTitleEs: mapping.practice.lesson.titleEs,
        lessonTitleEn: mapping.practice.lesson.titleEn,
        moduleId: mapping.practice.lesson.module.id,
        moduleTitleEs: mapping.practice.lesson.module.titleEs,
        moduleTitleEn: mapping.practice.lesson.module.titleEn,
      })),
    };
  }

  async logSessionEvent(dto: LogSimulatorSessionEventDto, user: JwtPayload) {
    const session = await this.prisma.simulatorSession.findUnique({
      where: {
        id: dto.sessionId,
      },
      include: {
        simulator: true,
      },
    });

    if (!session) {
      throw new NotFoundException("Simulator session not found");
    }

    await this.assertSessionAccess(session.id, session.studentId, user);

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "SIMULATOR_SESSION_EVENT",
        entityType: "SimulatorSession",
        entityId: session.id,
        meta: JSON.parse(
          JSON.stringify({
            simulatorId: session.simulatorId,
            eventType: dto.eventType,
            stepKey: dto.stepKey,
            componentKey: dto.componentKey,
            faultCode: dto.faultCode,
            meta: dto.meta ?? {},
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return {
      sessionId: session.id,
      logged: true,
      eventType: dto.eventType,
    };
  }

  private async resolveSessionContext(
    simulatorId: string,
    enrollmentId: string | undefined,
    studentId: string,
    user: JwtPayload,
  ) {
    if (user.roles.includes("STUDENT") && user.sub !== studentId) {
      throw new ForbiddenException("Students can only open their own simulator sessions");
    }

    const simulator = await this.prisma.simulator.findUnique({
      where: {
        id: simulatorId,
      },
      include: {
        mappings: {
          include: {
            practice: {
              include: {
                lesson: {
                  include: {
                    module: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!simulator) {
      throw new NotFoundException("Simulator not found");
    }

    if (!enrollmentId) {
      throw new BadRequestException("Simulator sessions require enrollment context");
    }

    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: {
        id: enrollmentId,
      },
    });

    if (!enrollment || enrollment.institutionId !== user.institutionId) {
      throw new NotFoundException("Enrollment not found");
    }

    if (enrollment.studentId !== studentId) {
      throw new BadRequestException("Enrollment does not belong to the selected student");
    }

    const validMappings = simulator.mappings.filter(
      (mapping) => mapping.practice.lesson.module.courseId === enrollment.courseId,
    );

    if (!validMappings.length) {
      throw new BadRequestException(
        "Simulator is not mapped to a practice inside the enrollment course",
      );
    }

    return {
      simulatorId: simulator.id,
      practiceIds: validMappings.map((mapping) => mapping.practiceId),
      moduleIds: Array.from(
        new Set(validMappings.map((mapping) => mapping.practice.lesson.moduleId)),
      ),
      bridge: validMappings.map((mapping) => ({
        practiceId: mapping.practice.id,
        lessonId: mapping.practice.lessonId,
        moduleId: mapping.practice.lesson.moduleId,
      })),
    };
  }

  private async assertSessionAccess(
    sessionId: string,
    studentId: string,
    user: JwtPayload,
  ) {
    if (user.roles.includes("ADMIN") || user.roles.includes("SUPPORT")) {
      return;
    }

    if (user.roles.includes("STUDENT")) {
      if (user.sub !== studentId) {
        throw new ForbiddenException("Students can only access their own simulator sessions");
      }

      return;
    }

    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const session = await this.prisma.simulatorSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        enrollment: true,
      },
    });

    if (
      !session?.enrollmentId ||
      !session.enrollment ||
      !accessibleCourseIds.includes(session.enrollment.courseId)
    ) {
      throw new ForbiddenException("User cannot access this simulator session");
    }
  }
}
