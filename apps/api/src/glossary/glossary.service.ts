import { Injectable } from "@nestjs/common";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGlossaryTermRelationDto } from "./dto/create-glossary-term-relation.dto";
import { CreateGlossaryTermDto } from "./dto/create-glossary-term.dto";

@Injectable()
export class GlossaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(user: JwtPayload, requestedLang?: string) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const lang = this.i18nService.resolveLang(requestedLang, user.preferredLang);

    const terms = await this.prisma.glossaryTerm.findMany({
      include: {
        relations: {
          where: {
            contentResource: {
              lesson: {
                module: {
                  courseId: {
                    in: accessibleCourseIds,
                  },
                },
              },
            },
          },
          include: {
            contentResource: {
              include: {
                lesson: {
                  include: {
                    module: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        termEs: "asc",
      },
    });

    return terms.map((term) => ({
      ...term,
      locale: lang,
      localizedTerm: this.i18nService.pick(term.termEs, term.termEn, lang),
      localizedDefinition: this.i18nService.pick(
        term.definitionEs,
        term.definitionEn,
        lang,
      ),
      relations: term.relations.map((relation) => ({
        ...relation,
        contentResource: {
          ...relation.contentResource,
          localizedTitle: this.i18nService.pick(
            relation.contentResource.titleEs,
            relation.contentResource.titleEn,
            lang,
          ),
          lesson: {
            ...relation.contentResource.lesson,
            localizedTitle: this.i18nService.pick(
              relation.contentResource.lesson.titleEs,
              relation.contentResource.lesson.titleEn,
              lang,
            ),
            module: {
              ...relation.contentResource.lesson.module,
              localizedTitle: this.i18nService.pick(
                relation.contentResource.lesson.module.titleEs,
                relation.contentResource.lesson.module.titleEn,
                lang,
              ),
            },
          },
        },
      })),
    }));
  }

  create(dto: CreateGlossaryTermDto) {
    return this.prisma.glossaryTerm.create({
      data: dto,
    });
  }

  createRelation(dto: CreateGlossaryTermRelationDto) {
    return this.prisma.glossaryTermRelation.create({
      data: {
        glossaryTermId: dto.glossaryTermId,
        contentResourceId: dto.contentResourceId,
      },
      include: {
        glossaryTerm: true,
        contentResource: true,
      },
    });
  }
}
