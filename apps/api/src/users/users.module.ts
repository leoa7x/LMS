import { Module } from "@nestjs/common";
import { AdministrationScopeModule } from "../administration-scope/administration-scope.module";
import { AccessPolicyModule } from "../access-policy/access-policy.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [AccessPolicyModule, AdministrationScopeModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
