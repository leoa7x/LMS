import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SimulatorSessionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSimulatorMappingDto } from "./dto/create-simulator-mapping.dto";
import { CreateSimulatorDto } from "./dto/create-simulator.dto";
import { CreateSimulatorSessionDto } from "./dto/create-simulator-session.dto";
import { CompleteSimulatorSessionDto } from "./dto/complete-simulator-session.dto";

@Injectable()
export class SimulatorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.simulator.findMany({
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

  findMappings() {
    return this.prisma.simulatorMapping.findMany({
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

  createSession(dto: CreateSimulatorSessionDto) {
    return this.prisma.simulatorSession
      .create({
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
        },
      })
      .then(async (session) => {
        await this.prisma.auditLog.create({
          data: {
            userId: dto.studentId,
            action: "SIMULATOR_SESSION_STARTED",
            entityType: "SimulatorSession",
            entityId: session.id,
            meta: {
              simulatorId: dto.simulatorId,
              enrollmentId: dto.enrollmentId,
            },
          },
        });

        return session;
      });
  }

  findSessions() {
    return this.prisma.simulatorSession.findMany({
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

  async completeSession(dto: CompleteSimulatorSessionDto) {
    const session = await this.prisma.simulatorSession.findUnique({
      where: { id: dto.sessionId },
      include: {
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
}
