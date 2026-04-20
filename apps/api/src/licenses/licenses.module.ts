import { Module } from "@nestjs/common";
import { AdministrationScopeModule } from "../administration-scope/administration-scope.module";
import { LicensesController } from "./licenses.controller";
import { LicensesService } from "./licenses.service";

@Module({
  imports: [AdministrationScopeModule],
  controllers: [LicensesController],
  providers: [LicensesService],
})
export class LicensesModule {}
