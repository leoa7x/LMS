import { PrismaClient, SystemRole } from "@prisma/client";
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

  const institution = await prisma.institution.upsert({
    where: { slug: "ipt-veraguas" },
    update: {},
    create: {
      name: "Instituto Profesional y Tecnico de Veraguas",
      slug: "ipt-veraguas",
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
    },
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: SystemRole.ADMIN },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userInstitution.upsert({
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
    },
  });

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
