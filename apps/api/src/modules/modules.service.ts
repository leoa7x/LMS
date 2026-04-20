import { Injectable } from "@nestjs/common";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateModuleDto } from "./dto/create-module.dto";

@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(user: JwtPayload, requestedLang?: string) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const lang = this.i18nService.resolveLang(requestedLang, user.preferredLang);

    const modules = await this.prisma.module.findMany({
      where: {
        courseId: {
          in: accessibleCourseIds,
        },
      },
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

    return modules.map((module) => ({
      ...module,
      locale: lang,
      localizedTitle: this.i18nService.pick(module.titleEs, module.titleEn, lang),
      course: {
        ...module.course,
        localizedTitle: this.i18nService.pick(module.course.titleEs, module.course.titleEn, lang),
        technicalArea: {
          ...module.course.technicalArea,
          localizedName: this.i18nService.pick(
            module.course.technicalArea.nameEs,
            module.course.technicalArea.nameEn,
            lang,
          ),
        },
      },
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        localizedTitle: this.i18nService.pick(lesson.titleEs, lesson.titleEn, lang),
        localizedSummary: this.i18nService.pick(lesson.summaryEs, lesson.summaryEn, lang),
      })),
    }));
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
