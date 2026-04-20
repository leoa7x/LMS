import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EntityStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCampusDto } from "./dto/create-campus.dto";
import { CreateInstitutionDto } from "./dto/create-institution.dto";
import { CreateLaboratoryDto } from "./dto/create-laboratory.dto";
import { UpdateEntityStatusDto } from "./dto/update-entity-status.dto";

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.institution.findMany({
      include: {
        campuses: {
          include: {
            laboratories: true,
          },
        },
        licenses: true,
        contractTerms: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findOne(id: string) {
    return this.prisma.institution.findUnique({
      where: { id },
      include: {
        campuses: {
          include: {
            laboratories: true,
          },
        },
        licenses: true,
        contractTerms: true,
        users: true,
      },
    });
  }

  create(dto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        status: dto.status ?? EntityStatus.ACTIVE,
        officialCode: dto.officialCode,
        contactEmail: dto.contactEmail,
      },
    });
  }

  async updateInstitutionStatus(id: string, dto: UpdateEntityStatusDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException("Institution not found");
    }

    return this.prisma.institution.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  findCampuses() {
    return this.prisma.campus.findMany({
      include: {
        institution: true,
        laboratories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createCampus(dto: CreateCampusDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: dto.institutionId },
      select: { id: true, status: true },
    });

    if (!institution) {
      throw new NotFoundException("Institution not found");
    }

    if (institution.status !== EntityStatus.ACTIVE) {
      throw new BadRequestException("Cannot create campuses for an inactive institution");
    }

    return this.prisma.campus.create({
      data: {
        institutionId: dto.institutionId,
        name: dto.name,
        code: dto.code,
        address: dto.address,
        status: dto.status ?? EntityStatus.ACTIVE,
      },
      include: {
        institution: true,
        laboratories: true,
      },
    });
  }

  async updateCampusStatus(id: string, dto: UpdateEntityStatusDto) {
    const campus = await this.prisma.campus.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!campus) {
      throw new NotFoundException("Campus not found");
    }

    return this.prisma.campus.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  findLaboratories() {
    return this.prisma.laboratory.findMany({
      include: {
        campus: {
          include: {
            institution: true,
          },
        },
        technicalArea: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createLaboratory(dto: CreateLaboratoryDto) {
    const campus = await this.prisma.campus.findUnique({
      where: { id: dto.campusId },
      include: {
        institution: true,
      },
    });

    if (!campus) {
      throw new NotFoundException("Campus not found");
    }

    if (
      campus.status !== EntityStatus.ACTIVE ||
      campus.institution.status !== EntityStatus.ACTIVE
    ) {
      throw new BadRequestException(
        "Cannot create laboratories on an inactive campus or institution",
      );
    }

    return this.prisma.laboratory.create({
      data: {
        campusId: dto.campusId,
        technicalAreaId: dto.technicalAreaId,
        name: dto.name,
        description: dto.description,
        status: dto.status ?? EntityStatus.ACTIVE,
      },
      include: {
        campus: {
          include: {
            institution: true,
          },
        },
        technicalArea: true,
      },
    });
  }

  async updateLaboratoryStatus(id: string, dto: UpdateEntityStatusDto) {
    const laboratory = await this.prisma.laboratory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!laboratory) {
      throw new NotFoundException("Laboratory not found");
    }

    return this.prisma.laboratory.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }
}
