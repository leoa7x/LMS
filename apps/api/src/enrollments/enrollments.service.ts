import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.studentEnrollment.findMany({
      include: {
        institution: true,
        course: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        progress: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  async create(dto: CreateEnrollmentDto) {
    const enrollment = await this.prisma.studentEnrollment.create({
      data: dto,
      include: {
        institution: true,
        course: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.prisma.studentProgress.upsert({
      where: {
        enrollmentId: enrollment.id,
      },
      update: {},
      create: {
        enrollmentId: enrollment.id,
      },
    });

    return enrollment;
  }
}
