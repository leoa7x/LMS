import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredLang: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await hash(dto.password, 10);
    const roles = dto.roles ?? [];

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        preferredLang: dto.preferredLang ?? "es",
        roles: roles.length
          ? {
              create: roles.map((roleName) => ({
                role: {
                  connect: {
                    name: roleName,
                  },
                },
              })),
            }
          : undefined,
        institutions: dto.institutionId
          ? {
              create: {
                institution: {
                  connect: {
                    id: dto.institutionId,
                  },
                },
              },
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        institutions: {
          include: {
            institution: true,
          },
        },
      },
    });
  }
}
