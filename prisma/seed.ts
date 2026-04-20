import {
  EntityStatus,
  MembershipStatus,
  PrismaClient,
  ScopeStatus,
  ScopeType,
  SystemRole,
  UserStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = Object.values(SystemRole);

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const permissionsByRole: Record<SystemRole, string[]> = {
    ADMIN: [
      "users.read",
      "users.manage",
      "roles.read",
      "institutions.manage",
      "licenses.manage",
      "courses.manage",
      "enrollments.manage",
      "audit.read",
    ],
    TEACHER: [
      "users.read",
      "courses.read",
      "courses.manage.scope",
      "enrollments.read.scope",
      "progress.read.scope",
      "quizzes.manage.scope",
    ],
    STUDENT: [
      "courses.read.assigned",
      "quizzes.attempt",
      "progress.read.self",
      "simulators.use.assigned",
      "glossary.read",
    ],
    SUPPORT: [
      "users.read",
      "users.access.manage",
      "support.manage",
      "audit.read",
      "sessions.read",
    ],
  };

  for (const [roleName, permissionCodes] of Object.entries(permissionsByRole) as Array<
    [SystemRole, string[]]
  >) {
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });

    for (const code of permissionCodes) {
      const permission = await prisma.permission.upsert({
        where: { code },
        update: {},
        create: { code },
      });

      const existingLink = await prisma.rolePermission.findFirst({
        where: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      if (!existingLink) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  const institution = await prisma.institution.upsert({
    where: { slug: "ipt-veraguas" },
    update: {},
    create: {
      name: "Instituto Profesional y Tecnico de Veraguas",
      slug: "ipt-veraguas",
      status: EntityStatus.ACTIVE,
    },
  });

  const campus = await prisma.campus.upsert({
    where: {
      institutionId_name: {
        institutionId: institution.id,
        name: "Sede Principal",
      },
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Sede Principal",
      status: EntityStatus.ACTIVE,
    },
  });

  const laboratory = await prisma.laboratory.upsert({
    where: {
      campusId_name: {
        campusId: campus.id,
        name: "Laboratorio LMS",
      },
    },
    update: {},
    create: {
      campusId: campus.id,
      name: "Laboratorio LMS",
      status: EntityStatus.ACTIVE,
    },
  });

  const email = process.env.ADMIN_EMAIL ?? "admin@lms.local";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345!";
  const passwordHash = await hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      firstName: "Admin",
      lastName: "LMS",
      passwordHash,
      preferredLang: "es",
      status: UserStatus.ACTIVE,
      isActive: true,
    },
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: SystemRole.ADMIN },
  });

  const membership = await prisma.userInstitution.upsert({
    where: {
      userId_institutionId: {
        userId: admin.id,
        institutionId: institution.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      institutionId: institution.id,
      campusId: campus.id,
      laboratoryId: laboratory.id,
      membershipStatus: MembershipStatus.ACTIVE,
    },
  });

  const existingRoleAssignment = await prisma.userRole.findFirst({
    where: {
      userId: admin.id,
      roleId: adminRole.id,
      institutionMemberId: membership.id,
    },
  });

  if (!existingRoleAssignment) {
    await prisma.userRole.create({
      data: {
        userId: admin.id,
        roleId: adminRole.id,
        institutionMemberId: membership.id,
        scopeType: ScopeType.GLOBAL,
        scopeStatus: ScopeStatus.ACTIVE,
      },
    });
  }

  console.log(`Seed complete. Admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
