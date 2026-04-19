import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLicenseDto } from "./dto/create-license.dto";

@Injectable()
export class LicensesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.license.findMany({
      include: {
        institution: true,
        contractTerm: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  create(dto: CreateLicenseDto) {
    return this.prisma.license.create({
      data: {
        institutionId: dto.institutionId,
        contractTermId: dto.contractTermId,
        name: dto.name,
        durationMonths: dto.durationMonths ?? 36,
        seats: dto.seats,
      },
      include: {
        institution: true,
        contractTerm: true,
      },
    });
  }
}
