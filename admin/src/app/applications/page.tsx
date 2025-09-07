"use client";

import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type Application = {
  user_id: number;
  user_cv_id: number;
  name: string;
  email: string;
  job_type: string;
  job_position: string;
  cv_url: string;
  feedback?: string | null;
};

type InterviewReport = {
  id: number;
  email: string;
  user_id: number | null;
  user_cv_id: number | null;
  role_type: string | null;
  role_position: string | null;
  status: string;
  score: number;
  questions_asked: number;
  accuracy_pct: number;
  suitability: string | null;
  is_suitable: boolean;
  summary: string | null;
  strengths?: string[] | null;
  areas_to_improve?: string[] | null;
  next_steps?: string[] | null;
  scorecard?: {
    easy?: { asked: number; correct: number };
    medium?: { asked: number; correct: number };
    hard?: { asked: number; correct: number };
    accuracy_pct?: number;
    [k: string]: any;
  } | null;
  history?: Array<{
    question: string;
    answer: string;
    p_correct?: number;
    difficulty?: "easy" | "medium" | "hard" | string;
    is_correct?: boolean;
  }> | null;
  raw_feedback?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Application | null>(null);

  const token = useMemo(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem("access_token") || localStorage.getItem("token"))) || null,
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch(`${API_BASE_URL}/applications`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!resp.ok) {
          let msg = "Failed to fetch applications";
          try {
            const j = await resp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await resp.json();
        const list: Application[] = Array.isArray(data) ? data : data ? [data] : [];
        if (!cancelled) setRows(list);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Could not load applications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const openReport = (row: Application) => {
    setSelectedRow(row);
    setReportOpen(true);
  };

  const onDelete = async (user_cv_id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      // NOTE: adjust to your actual delete endpoint if different
      const resp = await fetch(`${API_BASE_URL}/applications/${user_cv_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) {
        let msg = "Failed to delete application";
        try {
          const j = await resp.json();
          msg = j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }
      setRows((prev) => prev.filter((r) => r.user_cv_id !== user_cv_id));
    } catch (e: any) {
      alert(e.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Applications</h2>
      </header>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-800">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Applicant</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Job-Position</th>
                <th className="px-4 py-3 text-left">Job-Type</th>
                <th className="px-4 py-3 text-left">CV</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.user_id}-${r.user_cv_id}`} className="border-t border-gray-800">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.job_position}</td>
                  <td className="px-4 py-3">{r.job_type}</td>
                  <td className="px-4 py-3">
                    <a
                      href={r.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300 hover:underline"
                    >
                      View CV
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openReport(r)}
                        className="rounded-lg border border-purple-800 px-3 py-1.5 hover:bg-gray-800"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => onDelete(r.user_cv_id)}
                        className="rounded-lg border border-red-800 px-3 py-1.5 text-red-300 hover:bg-red-800/30 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} row={selectedRow} />
    </div>
  );
}

function ReportModal({
  open,
  onClose,
  row,
}: {
  open: boolean;
  onClose: () => void;
  row: Application | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<InterviewReport[]>([]);

  const token = useMemo(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem("access_token") || localStorage.getItem("token"))) || null,
    []
  );

  useEffect(() => {
    let cancelled = false;

    const fetchReport = async () => {
      if (!open || !row) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `${API_BASE_URL}/interview-reports/by-cv/${row.user_cv_id}?limit=50&offset=0`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!resp.ok) {
          let msg = "Failed to load interview report";
          try {
            const j = await resp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await resp.json();
        const list: InterviewReport[] = Array.isArray(data) ? data : data ? [data] : [];
        if (!cancelled) setReports(list);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Could not load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [open, row, token]);

  if (!open || !row) return null;

  // Prefer the latest report (API route is already ordered newest first if you used the earlier backend snippet)
  const report = reports[0];

  // (Optional) fallback bullet extraction when arrays are empty but legacy plain-text feedback exists
  const strengths =
    (report?.strengths?.length ? report.strengths : extractBullets(row.feedback, "strength")) || [];
  const improvements =
    (report?.areas_to_improve?.length
      ? report.areas_to_improve
      : extractBullets(row.feedback, "improve")) || [];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-purple-900/50 bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 px-5 py-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-purple-300">Interview Report</div>
            <div className="text-lg font-semibold text-white">
              {row.name} · {row.job_position}
            </div>
            <div className="text-xs text-gray-400">{row.email}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-300 hover:bg-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-purple-600/20 px-2 py-1 text-purple-300">
              {row.job_type}
            </span>
            <span className="rounded-full bg-indigo-600/20 px-2 py-1 text-indigo-300">
              {row.job_position}
            </span>
            <a
              href={row.cv_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-600/20 px-2 py-1 text-emerald-300 hover:underline"
            >
              View CV
            </a>
          </div>

          {loading && <div className="text-gray-400">Loading report…</div>}
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && !report && (
            <div className="text-sm text-gray-400">No report found for this CV yet.</div>
          )}

          {!loading && !error && report && (
            <div className="space-y-6">
              {/* Top stats */}
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Status" value={report.status} />
                <Stat label="Score" value={String(report.score)} />
                <Stat label="Accuracy" value={`${Math.round(report.accuracy_pct)}%`} />
                <Stat
                  label="Suitability"
                  value={`${report.suitability ?? "—"}${report.is_suitable ? " ✅" : ""}`}
                />
              </div>

              {/* Summary */}
              <Card title="Summary">
                <div className="text-sm text-gray-300">
                  {report.summary || row.feedback || "—"}
                </div>
              </Card>

              {/* Strengths / Improvements */}
              <div className="grid gap-4 sm:grid-cols-2">
                <BulletCard title="Strengths" color="emerald" items={strengths} />
                <BulletCard title="Areas to Improve" color="rose" items={improvements} />
              </div>

              {/* Next steps */}
              {(report.next_steps?.length ?? 0) > 0 && (
                <BulletCard title="Next Steps" color="indigo" items={report.next_steps!} />
              )}

              {/* Scorecard */}
              {report.scorecard && (
                <Card title="Scorecard">
                  <div className="grid gap-3 sm:grid-cols-4">
                    {(["easy", "medium", "hard"] as const).map((k) => {
                      const sec = (report.scorecard as any)[k];
                      if (!sec) return null;
                      return (
                        <div
                          key={k}
                          className="rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm"
                        >
                          <div className="mb-1 text-gray-400 capitalize">{k}</div>
                          <div className="text-gray-300">
                            Asked: {sec.asked} · Correct: {sec.correct}
                          </div>
                        </div>
                      );
                    })}
                    {"accuracy_pct" in report.scorecard && (
                      <div className="rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm">
                        <div className="mb-1 text-gray-400">Section Accuracy</div>
                        <div className="text-gray-300">
                          {(report.scorecard.accuracy_pct ?? 0).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Q&A History */}
              {(report.history?.length ?? 0) > 0 && (
                <Card title="Q&A History">
                  <ul className="space-y-3">
                    {report.history!.map((h, i) => (
                      <li key={i} className="rounded-lg border border-gray-800 p-3">
                        <div className="mb-1 text-xs text-gray-400">
                          {h.difficulty ? (
                            <span className="mr-2 rounded bg-gray-800 px-1.5 py-0.5">
                              {h.difficulty}
                            </span>
                          ) : null}
                          {typeof h.p_correct === "number" ? (
                            <span className="mr-2 text-gray-500">
                              p_correct: {(h.p_correct * 100).toFixed(0)}%
                            </span>
                          ) : null}
                          {typeof h.is_correct === "boolean" ? (
                            <span className={h.is_correct ? "text-emerald-400" : "text-rose-400"}>
                              {h.is_correct ? "Correct" : "Incorrect"}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm">
                          <div className="mb-1 text-indigo-300">Q: {h.question}</div>
                          <div className="text-gray-300">A: {h.answer}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-800 bg-gray-950 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Close
          </button>
          <a
            href={row.cv_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Open CV
          </a>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-5">
      <div className="mb-2 text-sm font-medium text-gray-200">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function BulletCard({
  title,
  color,
  items,
}: {
  title: string;
  color: "emerald" | "rose" | "indigo";
  items: string[];
}) {
  // Avoid Tailwind's dynamic class purge by mapping classes
  const colors: Record<
    "emerald" | "rose" | "indigo",
    { border: string; bg: string; text: string }
  > = {
    emerald: {
      border: "border-emerald-900/40",
      bg: "bg-emerald-950/20",
      text: "text-emerald-200",
    },
    rose: { border: "border-rose-900/40", bg: "bg-rose-950/20", text: "text-rose-200" },
    indigo: {
      border: "border-indigo-900/40",
      bg: "bg-indigo-950/20",
      text: "text-indigo-200",
    },
  };
  const c = colors[color];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className={`mb-2 text-sm font-semibold ${c.text}`}>{title}</div>
      {items?.length ? (
        <ul className="list-disc pl-5 text-sm text-gray-300">
          {items.map((x, i) => (
            <li key={i} className="mb-1">
              {x}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-400">—</div>
      )}
    </div>
  );
}

// naive heuristic splitter as a fallback when arrays aren't provided by API
function extractBullets(text?: string | null, kind: "strength" | "improve" = "strength"): string[] {
  if (!text) return [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (kind === "strength") {
    return sentences
      .filter((s) =>
        /strong|good|excellent|solid|understanding|experience|skill/i.test(s)
      )
      .slice(0, 5);
  } else {
    return sentences
      .filter((s) => /lack|struggle|improve|gap|weak|better|depth/i.test(s))
      .slice(0, 5);
  }
}
