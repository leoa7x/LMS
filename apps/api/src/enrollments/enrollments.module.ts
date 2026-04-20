import { Module } from "@nestjs/common";
import { AdministrationScopeModule } from "../administration-scope/administration-scope.module";
import { EnrollmentsController } from "./enrollments.controller";
import { EnrollmentsService } from "./enrollments.service";

@Module({
  imports: [AdministrationScopeModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
