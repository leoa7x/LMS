import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateModuleDto } from "./dto/create-module.dto";

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.module.findMany({
      include: {
        course: {
          include: {
            technicalArea: true,
          },
        },
        lessons: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: [
        {
          courseId: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    });
  }

  create(dto: CreateModuleDto) {
    return this.prisma.module.create({
      data: dto,
      include: {
        course: true,
      },
    });
  }
}
