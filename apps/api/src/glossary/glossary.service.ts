import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGlossaryTermDto } from "./dto/create-glossary-term.dto";

@Injectable()
export class GlossaryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.glossaryTerm.findMany({
      orderBy: {
        termEs: "asc",
      },
    });
  }

  create(dto: CreateGlossaryTermDto) {
    return this.prisma.glossaryTerm.create({
      data: dto,
    });
  }
}
