import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CertificationStatus } from "@prisma/client";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { DashboardService } from "../dashboard/dashboard.service";
import { PrismaService } from "../prisma/prisma.service";
import { AddCertificationTrackCourseDto } from "./dto/add-certification-track-course.dto";
import { CreateCertificationTrackDto } from "./dto/create-certification-track.dto";

type EnrollmentCertificationResult = {
  enrollment: {
    course: {
      id: string;
    };
  };
  consolidatedResult: {
    resultStatus: string;
    finalDecision: {
      finalScore: number | null;
    };
  };
};

@Injectable()
export class CertificationTracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly dashboardService: DashboardService,
  ) {}

  async findAll(user: JwtPayload) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);

    return this.prisma.certificationTrack.findMany({
      where: {
        courses: {
          some: {
            courseId: {
              in: accessibleCourseIds,
            },
          },
        },
      },
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

  create(dto: CreateCertificationTrackDto) {
    return this.prisma.certificationTrack.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        issuer: dto.issuer,
        description: dto.description,
      },
    });
  }

  async addCourse(dto: AddCertificationTrackCourseDto) {
    const existing = await this.prisma.certificationTrackCourse.findUnique({
      where: {
        certificationTrackId_courseId: {
          certificationTrackId: dto.certificationTrackId,
          courseId: dto.courseId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Course is already linked to this certification track",
      );
    }

    return this.prisma.certificationTrackCourse.create({
      data: {
        certificationTrackId: dto.certificationTrackId,
        courseId: dto.courseId,
        sortOrder: dto.sortOrder ?? 1,
        isRequired: dto.isRequired ?? true,
        minimumScore: dto.minimumScore,
      },
      include: {
        certificationTrack: true,
        course: true,
      },
    });
  }

  async getStudentStatus(
    trackId: string,
    studentId: string,
    user: JwtPayload,
  ) {
    const track = await this.prisma.certificationTrack.findUnique({
      where: { id: trackId },
      include: {
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException("Certification track not found");
    }

    if (user.roles.includes("STUDENT") && user.sub !== studentId) {
      throw new ForbiddenException(
        "Students can only access their own certification status",
      );
    }

    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const visibleTrack = track.courses.some((item) =>
      accessibleCourseIds.includes(item.courseId),
    );

    if (!visibleTrack && !user.roles.includes("ADMIN") && !user.roles.includes("SUPPORT")) {
      throw new ForbiddenException(
        "User cannot access this certification track in the current scope",
      );
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
        studentId,
        courseId: {
          in: track.courses.map((item) => item.courseId),
        },
      },
      include: {
        learningPathAssignment: true,
      },
    });

    const results = await Promise.all(
      enrollments.map((enrollment) =>
        this.dashboardService.enrollmentResult(
          enrollment.id,
          user,
        ) as Promise<EnrollmentCertificationResult>,
      ),
    );

    const resultByCourseId = new Map(
      results.map((result: EnrollmentCertificationResult) => [
        result.enrollment.course.id,
        result,
      ]),
    );

    const requiredCourses = track.courses.filter((item) => item.isRequired);
    const completedRequiredCourses = requiredCourses.filter((item) => {
      const result = resultByCourseId.get(item.courseId);

      if (!result) {
        return false;
      }

      const finalScore = result.consolidatedResult.finalDecision.finalScore;
      const minimumScore = item.minimumScore ?? null;

      return (
        ["PASSED", "COMPLETED"].includes(result.consolidatedResult.resultStatus) &&
        (minimumScore === null ||
          finalScore === null ||
          finalScore >= minimumScore)
      );
    });

    const averageFinalScore = results.length
      ? Number(
          (
            results.reduce(
              (sum: number, result: EnrollmentCertificationResult) =>
                sum + (result.consolidatedResult.finalDecision.finalScore ?? 0),
              0,
            ) / results.length
          ).toFixed(2),
        )
      : null;

    let status: CertificationStatus = CertificationStatus.NOT_STARTED;
    if (completedRequiredCourses.length === requiredCourses.length && requiredCourses.length > 0) {
      status = CertificationStatus.ELIGIBLE;
    } else if (results.length > 0) {
      status = CertificationStatus.IN_PROGRESS;
    }

    const learningPathAssignmentId =
      enrollments.find((item) => item.learningPathAssignmentId)?.learningPathAssignmentId ??
      null;

    const saved = await this.prisma.studentCertificationStatus.upsert({
      where: {
        studentId_certificationTrackId: {
          studentId,
          certificationTrackId: trackId,
        },
      },
      update: {
        institutionId: user.institutionId,
        learningPathAssignmentId,
        status,
        requiredCourses: requiredCourses.length,
        completedRequiredCourses: completedRequiredCourses.length,
        averageFinalScore,
        eligibleAt:
          status === CertificationStatus.ELIGIBLE ? new Date() : null,
        lastCalculatedAt: new Date(),
      },
      create: {
        institutionId: user.institutionId,
        studentId,
        certificationTrackId: trackId,
        learningPathAssignmentId,
        status,
        requiredCourses: requiredCourses.length,
        completedRequiredCourses: completedRequiredCourses.length,
        averageFinalScore,
        eligibleAt:
          status === CertificationStatus.ELIGIBLE ? new Date() : null,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        certificationTrack: true,
        learningPathAssignment: {
          include: {
            learningPath: true,
          },
        },
      },
    });

    return {
      status: saved,
      track: {
        id: track.id,
        slug: track.slug,
        name: track.name,
        issuer: track.issuer,
      },
      requirements: track.courses.map((item) => {
        const result = resultByCourseId.get(item.courseId);
        const finalScore = result?.consolidatedResult.finalDecision.finalScore ?? null;
        const completed =
          result &&
          ["PASSED", "COMPLETED"].includes(result.consolidatedResult.resultStatus) &&
          (item.minimumScore === null ||
            finalScore === null ||
            finalScore >= item.minimumScore);

        return {
          courseId: item.courseId,
          titleEs: item.course.titleEs,
          sortOrder: item.sortOrder,
          isRequired: item.isRequired,
          minimumScore: item.minimumScore,
          resultStatus: result?.consolidatedResult.resultStatus ?? "NOT_STARTED",
          finalScore,
          completed,
        };
      }),
    };
  }

  async listTrackStatuses(trackId: string, user: JwtPayload) {
    const track = await this.prisma.certificationTrack.findUnique({
      where: { id: trackId },
      select: {
        id: true,
        courses: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException("Certification track not found");
    }

    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const visibleTrack = track.courses.some((item) =>
      accessibleCourseIds.includes(item.courseId),
    );

    if (!visibleTrack && !user.roles.includes("ADMIN") && !user.roles.includes("SUPPORT")) {
      throw new ForbiddenException(
        "User cannot access this certification track in the current scope",
      );
    }

    return this.prisma.studentCertificationStatus.findMany({
      where: {
        institutionId: user.institutionId,
        certificationTrackId: trackId,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        learningPathAssignment: {
          include: {
            learningPath: true,
          },
        },
      },
      orderBy: [
        {
          status: "desc",
        },
        {
          lastCalculatedAt: "desc",
        },
      ],
    });
  }
}
