import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContentResourceDto } from "./dto/create-content-resource.dto";

@Injectable()
export class ContentResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.contentResource.findMany({
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
      orderBy: {
        titleEs: "asc",
      },
    });
  }

  create(dto: CreateContentResourceDto) {
    return this.prisma.contentResource.create({
      data: {
        lessonId: dto.lessonId,
        type: dto.type,
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        uri: dto.uri,
        bodyEs: dto.bodyEs,
        bodyEn: dto.bodyEn,
        voiceoverEnabled: dto.voiceoverEnabled ?? false,
      },
      include: {
        lesson: true,
      },
    });
  }
}
