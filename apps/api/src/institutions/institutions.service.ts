import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInstitutionDto } from "./dto/create-institution.dto";

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.institution.findMany({
      include: {
        licenses: true,
        contractTerms: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  create(dto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: dto,
    });
  }
}
