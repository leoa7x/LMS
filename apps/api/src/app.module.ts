import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
import { LearningPathsModule } from "./learning-paths/learning-paths.module";
import { LessonsModule } from "./lessons/lessons.module";
import { LessonSegmentsModule } from "./lesson-segments/lesson-segments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PracticesModule } from "./practices/practices.module";
import { LicensesModule } from "./licenses/licenses.module";
import { ModulesModule } from "./modules/modules.module";
import { ProgressModule } from "./progress/progress.module";
import { RolesModule } from "./roles/roles.module";
import { SimulatorsModule } from "./simulators/simulators.module";
import { TechnicalAreasModule } from "./technical-areas/technical-areas.module";
import { QuizzesModule } from "./quizzes/quizzes.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
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
    LessonsModule,
    LessonSegmentsModule,
    PracticesModule,
    ContentResourcesModule,
    GlossaryModule,
    QuizzesModule,
    ProgressModule,
    DashboardModule,
    SimulatorsModule,
  ],
})
export class AppModule {}
