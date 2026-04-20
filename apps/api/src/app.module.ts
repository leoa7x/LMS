import { Module } from "@nestjs/common";
import { AcademicVisibilityModule } from "./academic-visibility/academic-visibility.module";
import { AdministrationScopeModule } from "./administration-scope/administration-scope.module";
import { ConfigModule } from "@nestjs/config";
import { AccessPolicyModule } from "./access-policy/access-policy.module";
import { AuthModule } from "./auth/auth.module";
import { AuditModule } from "./audit/audit.module";
import { CertificationTracksModule } from "./certification-tracks/certification-tracks.module";
import { ContentResourcesModule } from "./content-resources/content-resources.module";
import { CoursesModule } from "./courses/courses.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { GlossaryModule } from "./glossary/glossary.module";
import { HealthModule } from "./health/health.module";
import { InstitutionsModule } from "./institutions/institutions.module";
import { I18nModule } from "./i18n/i18n.module";
import { LearningPathsModule } from "./learning-paths/learning-paths.module";
import { LessonsModule } from "./lessons/lessons.module";
import { LessonSegmentsModule } from "./lesson-segments/lesson-segments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PracticesModule } from "./practices/practices.module";
import { LicensesModule } from "./licenses/licenses.module";
import { ModulesModule } from "./modules/modules.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ProgressModule } from "./progress/progress.module";
import { RolesModule } from "./roles/roles.module";
import { SimulatorsModule } from "./simulators/simulators.module";
import { SupportModule } from "./support/support.module";
import { TechnicalAreasModule } from "./technical-areas/technical-areas.module";
import { QuizzesModule } from "./quizzes/quizzes.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    AcademicVisibilityModule,
    AdministrationScopeModule,
    AccessPolicyModule,
    I18nModule,
    AuditModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    CertificationTracksModule,
    RolesModule,
    UsersModule,
    InstitutionsModule,
    LearningPathsModule,
    LicensesModule,
    EnrollmentsModule,
    TechnicalAreasModule,
    CoursesModule,
    ModulesModule,
    NotificationsModule,
    LessonsModule,
    LessonSegmentsModule,
    PracticesModule,
    ContentResourcesModule,
    GlossaryModule,
    QuizzesModule,
    ProgressModule,
    DashboardModule,
    SimulatorsModule,
    SupportModule,
  ],
})
export class AppModule {}
