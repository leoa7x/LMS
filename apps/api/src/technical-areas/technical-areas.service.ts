import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTechnicalAreaDto } from "./dto/create-technical-area.dto";

@Injectable()
export class TechnicalAreasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.technicalArea.findMany({
      include: {
        courses: true,
      },
      orderBy: {
        nameEs: "asc",
      },
    });
  }

  create(dto: CreateTechnicalAreaDto) {
    return this.prisma.technicalArea.create({
      data: dto,
    });
  }
}
