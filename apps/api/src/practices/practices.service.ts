import { Injectable } from "@nestjs/common";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePracticeDto } from "./dto/create-practice.dto";

@Injectable()
export class PracticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(user: JwtPayload, requestedLang?: string) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const lang = this.i18nService.resolveLang(requestedLang, user.preferredLang);

    const practices = await this.prisma.practice.findMany({
      where: {
        lesson: {
          module: {
            courseId: {
              in: accessibleCourseIds,
            },
          },
        },
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        simulatorMappings: {
          include: {
            simulator: true,
          },
        },
      },
      orderBy: {
        titleEs: "asc",
      },
    });

    return practices.map((practice) => ({
      ...practice,
      locale: lang,
      localizedTitle: this.i18nService.pick(practice.titleEs, practice.titleEn, lang),
      lesson: {
        ...practice.lesson,
        localizedTitle: this.i18nService.pick(practice.lesson.titleEs, practice.lesson.titleEn, lang),
        module: {
          ...practice.lesson.module,
          localizedTitle: this.i18nService.pick(
            practice.lesson.module.titleEs,
            practice.lesson.module.titleEn,
            lang,
          ),
          course: {
            ...practice.lesson.module.course,
            localizedTitle: this.i18nService.pick(
              practice.lesson.module.course.titleEs,
              practice.lesson.module.course.titleEn,
              lang,
            ),
          },
        },
      },
    }));
  }

  create(dto: CreatePracticeDto) {
    return this.prisma.practice.create({
      data: {
        lessonId: dto.lessonId,
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        instructions: dto.instructions,
        requiresSimulator: dto.requiresSimulator ?? false,
      },
      include: {
        lesson: true,
      },
    });
  }
}
