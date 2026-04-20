import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContractTermDto } from "./dto/create-contract-term.dto";
import { CreateLicenseDto } from "./dto/create-license.dto";

@Injectable()
export class LicensesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllContracts() {
    return this.prisma.contractTerm.findMany({
      include: {
        institution: true,
        licenses: true,
        memberships: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createContractTerm(dto: CreateContractTermDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (endAt <= startAt) {
      throw new BadRequestException("Contract end date must be after start date");
    }

    const institution = await this.prisma.institution.findUnique({
      where: { id: dto.institutionId },
      select: { id: true, status: true },
    });

    if (!institution) {
      throw new NotFoundException("Institution not found");
    }

    return this.prisma.contractTerm.create({
      data: {
        institutionId: dto.institutionId,
        startAt,
        endAt,
        concurrentCap: dto.concurrentCap,
      },
      include: {
        institution: true,
        licenses: true,
      },
    });
  }

  findAll() {
    return this.prisma.license.findMany({
      include: {
        institution: true,
        contractTerm: true,
        memberships: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(dto: CreateLicenseDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: dto.institutionId },
      select: { id: true, status: true },
    });

    if (!institution) {
      throw new NotFoundException("Institution not found");
    }

    if (dto.contractTermId) {
      const contractTerm = await this.prisma.contractTerm.findUnique({
        where: { id: dto.contractTermId },
        select: {
          id: true,
          institutionId: true,
          startAt: true,
          endAt: true,
        },
      });

      if (!contractTerm) {
        throw new NotFoundException("Contract term not found");
      }

      if (contractTerm.institutionId !== dto.institutionId) {
        throw new BadRequestException(
          "License contract term must belong to the same institution",
        );
      }
    }

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
