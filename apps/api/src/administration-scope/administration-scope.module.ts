import { Module } from "@nestjs/common";
import { AdministrationScopeService } from "./administration-scope.service";

@Module({
  providers: [AdministrationScopeService],
  exports: [AdministrationScopeService],
})
export class AdministrationScopeModule {}
