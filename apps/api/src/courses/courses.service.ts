import { Injectable } from "@nestjs/common";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(user: JwtPayload, requestedLang?: string) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const lang = this.i18nService.resolveLang(requestedLang, user.preferredLang);

    const courses = await this.prisma.course.findMany({
      where: {
        id: {
          in: accessibleCourseIds,
        },
      },
      include: {
        technicalArea: true,
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courses.map((course) => ({
      ...course,
      locale: lang,
      localizedTitle: this.i18nService.pick(course.titleEs, course.titleEn, lang),
      localizedDescription: this.i18nService.pick(
        course.descriptionEs,
        course.descriptionEn,
        lang,
      ),
      technicalArea: {
        ...course.technicalArea,
        localizedName: this.i18nService.pick(
          course.technicalArea.nameEs,
          course.technicalArea.nameEn,
          lang,
        ),
      },
      modules: course.modules.map((module) => ({
        ...module,
        localizedTitle: this.i18nService.pick(module.titleEs, module.titleEn, lang),
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          localizedTitle: this.i18nService.pick(lesson.titleEs, lesson.titleEn, lang),
          localizedSummary: this.i18nService.pick(
            lesson.summaryEs,
            lesson.summaryEn,
            lang,
          ),
        })),
      })),
    }));
  }

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        technicalAreaId: dto.technicalAreaId,
        slug: dto.slug,
        code: dto.code,
        courseKind: dto.courseKind ?? "STANDARD",
        titleEs: dto.titleEs,
        titleEn: dto.titleEn,
        descriptionEs: dto.descriptionEs,
        descriptionEn: dto.descriptionEn,
        isPublished: dto.isPublished ?? false,
        progressStrategy: dto.progressStrategy ?? "weighted",
        vendorCoverageTags: dto.vendorCoverageTags ?? [],
        technologyCoverageTags: dto.technologyCoverageTags ?? [],
        lessonWeight: dto.lessonWeight ?? 20,
        practiceWeight: dto.practiceWeight ?? 30,
        evaluationWeight: dto.evaluationWeight ?? 20,
        simulatorWeight: dto.simulatorWeight ?? 30,
      },
      include: {
        technicalArea: true,
        learningPaths: true,
        certificationMap: true,
      },
    }).then(async (course) => {
      await this.prisma.auditLog.create({
        data: {
          action: "COURSE_CREATED",
          entityType: "Course",
          entityId: course.id,
          meta: {
            technicalAreaId: dto.technicalAreaId,
            slug: dto.slug,
            vendorCoverageTags: dto.vendorCoverageTags ?? [],
            technologyCoverageTags: dto.technologyCoverageTags ?? [],
          },
        },
      });

      return course;
    });
  }
}
