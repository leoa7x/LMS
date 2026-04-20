import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PracticeAttemptStatus } from "@prisma/client";
import { AcademicVisibilityService } from "../academic-visibility/academic-visibility.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { I18nService } from "../i18n/i18n.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContentResourceDto } from "./dto/create-content-resource.dto";
import { CreateContentResourceVersionDto } from "./dto/create-content-resource-version.dto";
import { CreateModulePdfExportTemplateDto } from "./dto/create-module-pdf-export-template.dto";
import { ModulePdfExportQueryDto } from "./dto/module-pdf-export-query.dto";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdfBuffer(lines: string[]) {
  const sanitizedLines = lines.slice(0, 45).map((line) => escapePdfText(line));
  const contentStream = [
    "BT",
    "/F1 12 Tf",
    "50 780 Td",
    ...sanitizedLines.flatMap((line, index) =>
      index === 0 ? [`(${line}) Tj`] : ["0 -16 Td", `(${line}) Tj`],
    ),
    "ET",
  ].join("\n");
  const contentLength = Buffer.byteLength(contentStream, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += object;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

@Injectable()
export class ContentResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicVisibilityService: AcademicVisibilityService,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(user: JwtPayload, requestedLang?: string) {
    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);
    const lang = this.i18nService.resolveLang(requestedLang, user.preferredLang);

    const resources = await this.prisma.contentResource.findMany({
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
                pdfExportTemplate: true,
              },
            },
          },
        },
        versions: {
          orderBy: {
            releasedAt: "desc",
          },
        },
        glossaryLinks: {
          include: {
            glossaryTerm: true,
          },
        },
      },
      orderBy: {
        titleEs: "asc",
      },
    });

    return resources.map((resource) => ({
      ...resource,
      locale: lang,
      localizedTitle: this.i18nService.pick(resource.titleEs, resource.titleEn, lang),
      localizedBody: this.i18nService.pick(resource.bodyEs, resource.bodyEn, lang),
      lesson: {
        ...resource.lesson,
        localizedTitle: this.i18nService.pick(
          resource.lesson.titleEs,
          resource.lesson.titleEn,
          lang,
        ),
        module: {
          ...resource.lesson.module,
          localizedTitle: this.i18nService.pick(
            resource.lesson.module.titleEs,
            resource.lesson.module.titleEn,
            lang,
          ),
          course: {
            ...resource.lesson.module.course,
            localizedTitle: this.i18nService.pick(
              resource.lesson.module.course.titleEs,
              resource.lesson.module.course.titleEn,
              lang,
            ),
          },
        },
      },
      versions: resource.versions.map((version) => ({
        ...version,
        localizedTitle: this.i18nService.pick(version.titleEs, version.titleEn, lang),
        localizedBody: this.i18nService.pick(version.bodyEs, version.bodyEn, lang),
      })),
      glossaryLinks: resource.glossaryLinks.map((link) => ({
        ...link,
        glossaryTerm: {
          ...link.glossaryTerm,
          localizedTerm: this.i18nService.pick(
            link.glossaryTerm.termEs,
            link.glossaryTerm.termEn,
            lang,
          ),
          localizedDefinition: this.i18nService.pick(
            link.glossaryTerm.definitionEs,
            link.glossaryTerm.definitionEn,
            lang,
          ),
        },
      })),
    }));
  }

  async create(dto: CreateContentResourceDto) {
    return this.prisma.$transaction(async (tx) => {
      const resource = await tx.contentResource.create({
        data: {
          lessonId: dto.lessonId,
          type: dto.type,
          titleEs: dto.titleEs,
          titleEn: dto.titleEn,
          uri: dto.uri,
          bodyEs: dto.bodyEs,
          bodyEn: dto.bodyEn,
          voiceoverEnabled: dto.voiceoverEnabled ?? false,
        },
        include: {
          lesson: true,
        },
      });

      await tx.contentResourceVersion.create({
        data: {
          contentResourceId: resource.id,
          versionLabel: "v1",
          titleEs: resource.titleEs,
          titleEn: resource.titleEn,
          bodyEs: resource.bodyEs,
          bodyEn: resource.bodyEn,
          uri: resource.uri,
          isCurrent: true,
        },
      });

      return resource;
    });
  }

  createVersion(dto: CreateContentResourceVersionDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isCurrent) {
        await tx.contentResourceVersion.updateMany({
          where: {
            contentResourceId: dto.contentResourceId,
          },
          data: {
            isCurrent: false,
          },
        });
      }

      return tx.contentResourceVersion.create({
        data: {
          contentResourceId: dto.contentResourceId,
          versionLabel: dto.versionLabel,
          titleEs: dto.titleEs,
          titleEn: dto.titleEn,
          bodyEs: dto.bodyEs,
          bodyEn: dto.bodyEn,
          uri: dto.uri,
          isCurrent: dto.isCurrent ?? false,
        },
      });
    });
  }

  findPdfTemplates() {
    return this.prisma.modulePdfExportTemplate.findMany({
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  createPdfTemplate(dto: CreateModulePdfExportTemplateDto) {
    return this.prisma.modulePdfExportTemplate.upsert({
      where: {
        moduleId: dto.moduleId,
      },
      update: {
        isEnabled: dto.isEnabled ?? true,
        titleTemplate: dto.titleTemplate,
        includeSkillEvidence: dto.includeSkillEvidence ?? true,
        includePracticeSummary: dto.includePracticeSummary ?? true,
      },
      create: {
        moduleId: dto.moduleId,
        isEnabled: dto.isEnabled ?? true,
        titleTemplate: dto.titleTemplate,
        includeSkillEvidence: dto.includeSkillEvidence ?? true,
        includePracticeSummary: dto.includePracticeSummary ?? true,
      },
      include: {
        module: true,
      },
    });
  }

  async exportModulePdf(
    moduleId: string,
    user: JwtPayload,
    query: ModulePdfExportQueryDto,
  ) {
    const lang = this.i18nService.resolveLang(query.lang, user.preferredLang);
    const moduleRecord = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        course: true,
        lessons: {
          include: {
            practices: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        pdfExportTemplate: true,
      },
    });

    if (!moduleRecord) {
      throw new NotFoundException("Module not found");
    }

    const accessibleCourseIds =
      await this.academicVisibilityService.getAccessibleCourseIds(user);

    if (!accessibleCourseIds.includes(moduleRecord.courseId)) {
      throw new ForbiddenException("User cannot export this module");
    }

    const effectiveStudentId = user.roles.includes("STUDENT")
      ? user.sub
      : query.studentId;

    if (!effectiveStudentId) {
      throw new BadRequestException(
        "studentId is required for module PDF export outside the student role",
      );
    }

    if (user.roles.includes("STUDENT") && query.studentId && query.studentId !== user.sub) {
      throw new ForbiddenException("Students can only export their own module PDF");
    }

    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        institutionId: user.institutionId,
        studentId: effectiveStudentId,
        courseId: moduleRecord.courseId,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        progress: true,
        lessonProgress: {
          where: {
            lesson: {
              moduleId,
            },
            completedAt: {
              not: null,
            },
          },
        },
        practiceAttempts: {
          where: {
            practice: {
              lesson: {
                moduleId,
              },
            },
          },
          orderBy: {
            submittedAt: "desc",
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found for this module export");
    }

    const lessonIds = moduleRecord.lessons.map((lesson) => lesson.id);
    const practiceIds = moduleRecord.lessons.flatMap((lesson) =>
      lesson.practices.map((practice) => practice.id),
    );

    const [skillEvidence, completedSegments] = await Promise.all([
      moduleRecord.pdfExportTemplate?.includeSkillEvidence
        ? this.prisma.skillEvidence.findMany({
            where: {
              studentId: effectiveStudentId,
              practiceId: {
                in: practiceIds,
              },
            },
            include: {
              practice: {
                select: {
                  titleEs: true,
                  titleEn: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          })
        : Promise.resolve([]),
      this.prisma.lessonSegmentProgress.count({
        where: {
          enrollmentId: enrollment.id,
          lessonSegment: {
            lessonId: {
              in: lessonIds,
            },
          },
          completedAt: {
            not: null,
          },
        },
      }),
    ]);

    const progressPct = enrollment.progress[0]?.progressPct ?? 0;
    const localizedModuleTitle = this.i18nService.pick(
      moduleRecord.titleEs,
      moduleRecord.titleEn,
      lang,
    ) ?? moduleRecord.titleEs;
    const localizedCourseTitle = this.i18nService.pick(
      moduleRecord.course.titleEs,
      moduleRecord.course.titleEn,
      lang,
    ) ?? moduleRecord.course.titleEs;
    const titleTemplate =
      moduleRecord.pdfExportTemplate?.titleTemplate ?? "Reporte del modulo {{module}}";
    const reportTitle = titleTemplate.replace("{{module}}", localizedModuleTitle);
    const passedPractices = enrollment.practiceAttempts.filter(
      (attempt) => attempt.status === PracticeAttemptStatus.PASSED,
    );
    const averagePracticeScore = passedPractices.length
      ? passedPractices.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) /
        passedPractices.length
      : null;

    const lines = [
      reportTitle,
      `${lang === "en" ? "Course" : "Curso"}: ${localizedCourseTitle}`,
      `${lang === "en" ? "Student" : "Estudiante"}: ${enrollment.student.firstName} ${enrollment.student.lastName}`,
      `${lang === "en" ? "Email" : "Correo"}: ${enrollment.student.email}`,
      `${lang === "en" ? "Progress" : "Progreso"}: ${Number(progressPct.toFixed(2))}%`,
      `${lang === "en" ? "Completed lessons" : "Lecciones completadas"}: ${enrollment.lessonProgress.length}/${moduleRecord.lessons.length}`,
      `${lang === "en" ? "Completed segments" : "Segmentos completados"}: ${completedSegments}`,
    ];

    if (moduleRecord.pdfExportTemplate?.includePracticeSummary ?? true) {
      lines.push(
        `${lang === "en" ? "Practice attempts" : "Intentos de practica"}: ${enrollment.practiceAttempts.length}`,
      );
      lines.push(
        `${lang === "en" ? "Passed practices" : "Practicas aprobadas"}: ${passedPractices.length}/${practiceIds.length}`,
      );

      if (averagePracticeScore !== null) {
        lines.push(
          `${lang === "en" ? "Average practice score" : "Promedio de practicas"}: ${Number(
            averagePracticeScore.toFixed(2),
          )}`,
        );
      }
    }

    if (skillEvidence.length) {
      lines.push(lang === "en" ? "Skill evidence:" : "Evidencias de habilidad:");

      for (const evidence of skillEvidence) {
        const evidenceTitle = this.i18nService.pick(
          evidence.practice.titleEs,
          evidence.practice.titleEn,
          lang,
        );
        lines.push(`- ${evidenceTitle}: ${evidence.notes ?? "-"}`);
      }
    }

    const filename = `${moduleRecord.slug}-${effectiveStudentId}.pdf`;

    return {
      filename,
      buffer: buildSimplePdfBuffer(lines),
    };
  }
}
