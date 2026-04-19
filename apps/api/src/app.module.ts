import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { ContentResourcesModule } from "./content-resources/content-resources.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { GlossaryModule } from "./glossary/glossary.module";
import { HealthModule } from "./health/health.module";
import { InstitutionsModule } from "./institutions/institutions.module";
import { LessonsModule } from "./lessons/lessons.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PracticesModule } from "./practices/practices.module";
import { LicensesModule } from "./licenses/licenses.module";
import { ModulesModule } from "./modules/modules.module";
import { RolesModule } from "./roles/roles.module";
import { TechnicalAreasModule } from "./technical-areas/technical-areas.module";
import { QuizzesModule } from "./quizzes/quizzes.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    RolesModule,
    UsersModule,
    InstitutionsModule,
    LicensesModule,
    EnrollmentsModule,
    TechnicalAreasModule,
    CoursesModule,
    ModulesModule,
    LessonsModule,
    PracticesModule,
    ContentResourcesModule,
    GlossaryModule,
    QuizzesModule,
  ],
})
export class AppModule {}
