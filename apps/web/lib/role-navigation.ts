export type RoleKey = "ADMIN" | "TEACHER" | "STUDENT" | "SUPPORT";

export type NavigationItem = {
  href: string;
  label: string;
};

export const roleLabels: Record<RoleKey, string> = {
  ADMIN: "Administrador",
  TEACHER: "Docente",
  STUDENT: "Estudiante",
  SUPPORT: "Soporte",
};

export const defaultRouteByRole: Record<RoleKey, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  SUPPORT: "/admin/support",
};

export const navigationByRole: Record<RoleKey, NavigationItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Panel principal" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/institutions", label: "Institucion" },
    { href: "/admin/academic", label: "Oferta academica" },
    { href: "/admin/enrollments", label: "Inscripciones" },
    { href: "/admin/content", label: "Contenidos" },
    { href: "/admin/progress", label: "Progreso" },
    { href: "/admin/evaluations", label: "Evaluaciones" },
    { href: "/admin/results", label: "Resultados" },
    { href: "/admin/simulators", label: "Simuladores" },
    { href: "/admin/support", label: "Soporte" },
    { href: "/admin/audit", label: "Actividad y accesos" },
  ],
  TEACHER: [
    { href: "/teacher", label: "Panel principal" },
    { href: "/teacher/courses", label: "Cursos" },
    { href: "/teacher/content", label: "Contenidos" },
    { href: "/teacher/progress", label: "Progreso" },
    { href: "/teacher/evaluations", label: "Evaluaciones" },
    { href: "/teacher/results", label: "Resultados" },
    { href: "/teacher/simulators", label: "Simuladores" },
    { href: "/teacher/support", label: "Soporte" },
  ],
  STUDENT: [
    { href: "/student", label: "Panel principal" },
    { href: "/student/courses", label: "Mis cursos" },
    { href: "/student/content", label: "Contenidos" },
    { href: "/student/progress", label: "Mi progreso" },
    { href: "/student/evaluations", label: "Evaluaciones" },
    { href: "/student/results", label: "Resultados" },
    { href: "/student/simulators", label: "Simuladores" },
    { href: "/student/support", label: "Soporte" },
  ],
  SUPPORT: [
    { href: "/admin/support", label: "Soporte" },
    { href: "/admin/audit", label: "Actividad y accesos" },
    { href: "/admin", label: "Panel principal" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/institutions", label: "Institucion" },
  ],
};

export function getPrimaryRole(roles: string[]): RoleKey {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("TEACHER")) return "TEACHER";
  if (roles.includes("STUDENT")) return "STUDENT";
  return "SUPPORT";
}
