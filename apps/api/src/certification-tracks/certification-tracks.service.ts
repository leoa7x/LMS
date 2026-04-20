import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddCertificationTrackCourseDto } from "./dto/add-certification-track-course.dto";
import { CreateCertificationTrackDto } from "./dto/create-certification-track.dto";

@Injectable()
export class CertificationTracksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.certificationTrack.findMany({
      include: {
        courses: {
          include: {
            course: {
              include: {
                technicalArea: true,
              },
            },
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

  addCourse(dto: AddCertificationTrackCourseDto) {
    return this.prisma.certificationTrackCourse.create({
      data: {
        certificationTrackId: dto.certificationTrackId,
        courseId: dto.courseId,
      },
      include: {
        certificationTrack: true,
        course: true,
      },
    });
  }
}
