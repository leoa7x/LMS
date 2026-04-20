import { Injectable } from "@nestjs/common";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(user: JwtPayload, requestedLang?: string) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const lang = this.i18nService.resolveLang(requestedLang, user.preferredLang);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        module: {
          courseId: {
            in: accessibleCourseIds,
          },
        },
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                technicalArea: true,
              },
            },
          },
        },
        segments: {
          include: {
            resource: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        practices: true,
        resources: true,
      },
      orderBy: [
        {
          moduleId: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    });

    return lessons.map((lesson) => ({
      ...lesson,
      locale: lang,
      localizedTitle: this.i18nService.pick(lesson.titleEs, lesson.titleEn, lang),
      localizedSummary: this.i18nService.pick(lesson.summaryEs, lesson.summaryEn, lang),
      module: {
        ...lesson.module,
        localizedTitle: this.i18nService.pick(
          lesson.module.titleEs,
          lesson.module.titleEn,
          lang,
        ),
        course: {
          ...lesson.module.course,
          localizedTitle: this.i18nService.pick(
            lesson.module.course.titleEs,
            lesson.module.course.titleEn,
            lang,
          ),
          technicalArea: {
            ...lesson.module.course.technicalArea,
            localizedName: this.i18nService.pick(
              lesson.module.course.technicalArea.nameEs,
              lesson.module.course.technicalArea.nameEn,
              lang,
            ),
          },
        },
      },
      segments: lesson.segments.map((segment) => ({
        ...segment,
        localizedTitle: this.i18nService.pick(segment.titleEs, segment.titleEn, lang),
        localizedBody: this.i18nService.pick(segment.bodyEs, segment.bodyEn, lang),
        resource: segment.resource
          ? {
              ...segment.resource,
              localizedTitle: this.i18nService.pick(
                segment.resource.titleEs,
                segment.resource.titleEn,
                lang,
              ),
              localizedBody: this.i18nService.pick(
                segment.resource.bodyEs,
                segment.resource.bodyEn,
                lang,
              ),
            }
          : null,
      })),
      practices: lesson.practices.map((practice) => ({
        ...practice,
        localizedTitle: this.i18nService.pick(practice.titleEs, practice.titleEn, lang),
      })),
      resources: lesson.resources.map((resource) => ({
        ...resource,
        localizedTitle: this.i18nService.pick(resource.titleEs, resource.titleEn, lang),
        localizedBody: this.i18nService.pick(resource.bodyEs, resource.bodyEn, lang),
      })),
    }));
  }

  create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: dto,
      include: {
        module: true,
      },
    });
  }
}
