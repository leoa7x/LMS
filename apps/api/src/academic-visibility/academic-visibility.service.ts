import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AcademicVisibilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccessibleCourseIds(user: JwtPayload) {
    if (user.roles.includes("ADMIN") || user.roles.includes("SUPPORT")) {
      const courses = await this.prisma.course.findMany({
        select: { id: true },
      });
      return courses.map((course) => course.id);
    }

    if (user.roles.includes("TEACHER")) {
      return this.getTeacherAccessibleCourseIds(user);
    }

    return this.getStudentAccessibleCourseIds(user);
  }

  private async getTeacherAccessibleCourseIds(user: JwtPayload) {
    const now = new Date();
    const scopes = await this.prisma.teacherScopeAssignment.findMany({
      where: {
        teacherUserId: user.sub,
        AND: [
          {
            OR: [{ institutionId: null }, { institutionId: user.institutionId }],
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
    });

    if (!scopes.length) {
      return [];
    }

    if (scopes.some((scope) => scope.scopeType === "GLOBAL" || scope.scopeType === "INSTITUTION")) {
      const courses = await this.prisma.course.findMany({
        select: { id: true },
      });
      return courses.map((course) => course.id);
    }

    const courseIds = new Set<string>();

    const explicitCourseIds = scopes
      .map((scope) => scope.courseId)
      .filter((value): value is string => Boolean(value));
    explicitCourseIds.forEach((id) => courseIds.add(id));

    const technicalAreaIds = scopes
      .map((scope) => scope.technicalAreaId)
      .filter((value): value is string => Boolean(value));
    if (technicalAreaIds.length) {
      const coursesByArea = await this.prisma.course.findMany({
        where: {
          technicalAreaId: { in: technicalAreaIds },
        },
        select: { id: true },
      });
      coursesByArea.forEach((course) => courseIds.add(course.id));
    }

    const learningPathIds = scopes
      .map((scope) => scope.learningPathId)
      .filter((value): value is string => Boolean(value));
    if (learningPathIds.length) {
      const pathCourses = await this.prisma.learningPathCourse.findMany({
        where: {
          learningPathId: { in: learningPathIds },
        },
        select: { courseId: true },
      });
      pathCourses.forEach((entry) => courseIds.add(entry.courseId));
    }

    const levelCodes = scopes
      .map((scope) => scope.levelCode)
      .filter((value): value is string => Boolean(value));
    if (levelCodes.length) {
      const enrollmentsByLevel = await this.prisma.studentEnrollment.findMany({
        where: {
          institutionId: user.institutionId,
          assignedLevelCode: { in: levelCodes },
        },
        select: { courseId: true },
      });
      enrollmentsByLevel.forEach((entry) => courseIds.add(entry.courseId));
    }

    return Array.from(courseIds);
  }

  private async getStudentAccessibleCourseIds(user: JwtPayload) {
    const now = new Date();
    const courseIds = new Set<string>();

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
        studentId: user.sub,
        status: "ACTIVE",
      },
      select: { courseId: true },
    });
    enrollments.forEach((entry) => courseIds.add(entry.courseId));

    const profile = await this.prisma.studentAcademicProfile.findUnique({
      where: { userId: user.sub },
      include: {
        visibilityRules: true,
      },
    });

    if (profile) {
      const activeRules = profile.visibilityRules.filter(
        (rule) =>
          rule.effectiveFrom <= now &&
          (!rule.effectiveUntil || rule.effectiveUntil >= now),
      );

      activeRules
        .map((rule) => rule.courseId)
        .filter((value): value is string => Boolean(value))
        .forEach((id) => courseIds.add(id));

      const learningPathIds = activeRules
        .map((rule) => rule.learningPathId)
        .filter((value): value is string => Boolean(value));

      if (learningPathIds.length) {
        const pathCourses = await this.prisma.learningPathCourse.findMany({
          where: {
            learningPathId: { in: learningPathIds },
          },
          select: { courseId: true },
        });
        pathCourses.forEach((entry) => courseIds.add(entry.courseId));
      }
    }

    return Array.from(courseIds);
  }
}
