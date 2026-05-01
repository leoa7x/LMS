"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type ProgressRow = {
  progressPct: number;
  lessonsDone: number;
  segmentsDone: number;
  practicesDone: number;
  quizzesPassed: number;
  simulatorsDone: number;
  enrollment?: {
    student?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;
    course?: { titleEs?: string } | null;
  } | null;
};

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 rounded-full bg-slate-100">
      <div
        className="h-2.5 rounded-full bg-navy transition-[width]"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export default function AdminProgressPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [rows, setRows] = useState<ProgressRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<ProgressRow[]>("/progress", accessToken)
      .then(setRows)
      .catch(() => setRows([]));
  }, [accessToken]);

  const courseOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((item) => item.enrollment?.course?.titleEs).filter(Boolean)),
      ) as string[],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return rows.filter((item) => {
      const matchesCourse =
        courseFilter === "ALL" || item.enrollment?.course?.titleEs === courseFilter;
      const studentName =
        `${item.enrollment?.student?.firstName ?? ""} ${item.enrollment?.student?.lastName ?? ""}`.trim();
      const content = [
        studentName,
        item.enrollment?.student?.email ?? "",
        item.enrollment?.course?.titleEs ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesCourse && (!normalized || content.includes(normalized));
    });
  }, [courseFilter, rows, search]);

  const avgProgress = useMemo(() => {
    if (!filteredRows.length) return 0;
    return (
      filteredRows.reduce((accumulator, row) => accumulator + row.progressPct, 0) /
      filteredRows.length
    );
  }, [filteredRows]);

  return (
    <PortalShell
      eyebrow="Progreso"
      title="Seguimiento academico"
      description="Consulta el avance de las inscripciones visibles y revisa el comportamiento academico por curso y estudiante."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Inscripciones visibles"
            value={rows.length}
            helper="Registros con progreso consolidado disponible."
          />
          <StatCard
            label="Cursos visibles"
            value={courseOptions.length}
            helper="Cursos con seguimiento academico activo."
          />
          <StatCard
            label="Avance promedio"
            value={`${avgProgress.toFixed(1)}%`}
            helper="Promedio del progreso dentro de los filtros aplicados."
          />
          <StatCard
            label="Evaluaciones aprobadas"
            value={filteredRows.reduce((accumulator, row) => accumulator + row.quizzesPassed, 0)}
            helper="Resultados aprobados acumulados en la vista actual."
          />
        </section>

        <section className="mt-6 rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por estudiante o curso"
              className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
            />
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="rounded-2xl border border-cloud bg-white px-4 py-3 text-sm"
            >
              <option value="ALL">Todos los cursos</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6">
          <DataPanel
            title="Avance por inscripcion"
            description="Revisa el progreso consolidado y el detalle de lecciones, practicas, evaluaciones y simuladores por estudiante."
          >
            <div className="grid gap-4">
              {filteredRows.length ? (
                filteredRows.map((row, index) => {
                  const studentName =
                    `${row.enrollment?.student?.firstName ?? ""} ${row.enrollment?.student?.lastName ?? ""}`.trim() ||
                    row.enrollment?.student?.email ||
                    "Estudiante";

                  return (
                    <article
                      key={`${studentName}-${row.enrollment?.course?.titleEs ?? index}`}
                      className="rounded-3xl border border-cloud bg-white px-5 py-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                            {row.enrollment?.course?.titleEs ?? "Curso"}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950">
                            {studentName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-navy">
                            {row.progressPct.toFixed(1)}%
                          </p>
                          <p className="text-xs text-slate-500">Progreso total</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <ProgressBar value={row.progressPct} />
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {[
                          { label: "Lecciones", value: row.lessonsDone },
                          { label: "Segmentos", value: row.segmentsDone },
                          { label: "Practicas", value: row.practicesDone },
                          { label: "Evaluaciones", value: row.quizzesPassed },
                          { label: "Simuladores", value: row.simulatorsDone },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-xl font-semibold text-slate-950">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay inscripciones que coincidan con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
