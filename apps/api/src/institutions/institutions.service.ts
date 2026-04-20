import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EntityStatus } from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCampusDto } from "./dto/create-campus.dto";
import { CreateInstitutionDto } from "./dto/create-institution.dto";
import { CreateLaboratoryDto } from "./dto/create-laboratory.dto";
import { UpdateEntityStatusDto } from "./dto/update-entity-status.dto";

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: JwtPayload) {
    return this.prisma.institution.findMany({
      where: {
        id: user.institutionId,
      },
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

  findOne(id: string, user: JwtPayload) {
    if (id !== user.institutionId) {
      throw new ForbiddenException(
        "Institution detail must match the active institution context",
      );
    }

    return this.prisma.institution.findUnique({
      where: { id: user.institutionId },
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

  findCampuses(user: JwtPayload) {
    return this.prisma.campus.findMany({
      where: {
        institutionId: user.institutionId,
      },
      include: {
        institution: true,
        laboratories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createCampus(dto: CreateCampusDto, user: JwtPayload) {
    if (dto.institutionId !== user.institutionId) {
      throw new ForbiddenException(
        "Campus must be created inside the active institution context",
      );
    }

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

  findLaboratories(user: JwtPayload) {
    return this.prisma.laboratory.findMany({
      where: {
        campus: {
          institutionId: user.institutionId,
        },
      },
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

  async createLaboratory(dto: CreateLaboratoryDto, user: JwtPayload) {
    const campus = await this.prisma.campus.findUnique({
      where: { id: dto.campusId },
      include: {
        institution: true,
      },
    });

    if (!campus) {
      throw new NotFoundException("Campus not found");
    }

    if (campus.institutionId !== user.institutionId) {
      throw new ForbiddenException(
        "Laboratory must be created inside the active institution context",
      );
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
