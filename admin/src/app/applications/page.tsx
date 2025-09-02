// export default function ApplicationsPage() {
//   const rows = [
//     { applicant: "Ayesha Fernando", email: "Ayesha@gmail.com", position : "intern", jobType: "ML Engineer", cv: "ayesha_cv.pdf" },
//     { applicant: "Liam Perera", email: "Ayesha@gmail.com", position : "intern",  jobType: "Data Scientist", cv: "liam_cv.pdf" },
//     { applicant: "Nethmi Silva", email: "Ayesha@gmail.com", position : "intern", jobType: "Frontend Dev", cv: "nethmi_cv.pdf" },
//   ];

//   return (
//     <div className="space-y-6">
//       <header className="flex items-center justify-between">
//         <h2 className="text-2xl font-semibold">Applications</h2>
//         {/* <div className="flex gap-2">
//           <input
//             placeholder="Search applicant..."
//             className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//           />
//           <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
//             Filter
//           </button>
//         </div> */}
//       </header>

//       <div className="overflow-x-auto rounded-2xl border border-gray-800">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-900 text-gray-300">
//             <tr>
//               <th className="px-4 py-3 text-left">Applicant</th>
//               <th className="px-4 py-3 text-left">Email</th>
//               <th className="px-4 py-3 text-left">Job-Position</th>
//                <th className="px-4 py-3 text-left">Job-Type</th>
//               <th className="px-4 py-3 text-left">CV</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r) => (
//               <tr key={r.applicant} className="border-t border-gray-800">
//                 <td className="px-4 py-3">{r.applicant}</td>
//                 <td className="px-4 py-3">{r.email}</td>
//                 <td className="px-4 py-3">{r.position}</td>
//                 <td className="px-4 py-3">{r.jobType}</td>
//                  <td className="px-4 py-3">
//                   <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300">
//                     {r.cv}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 text-right">
//                   <div className="inline-flex gap-2">
               
//                     <button className="rounded-lg border border-purple-800 px-3 py-1.5 hover:bg-gray-800">
//                       View Report
//                     </button>
//                      <button className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800">
//                      Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type Application = {
  user_id: number;
  user_cv_id: number;
  name: string;
  email: string;
  job_type: string;
  job_position: string;
  cv_url: string;
  feedback?: string;
};

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Application | null>(null);

  const token = useMemo(
    () => (typeof window !== "undefined" && (localStorage.getItem("access_token") || localStorage.getItem("token"))) || null,
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
          try { const j = await resp.json(); msg = j?.detail || msg; } catch {}
          throw new Error(msg);
        }
        const data = await resp.json();
        // Normalize: backend may return a single object or a list
        const list: Application[] = Array.isArray(data) ? data : (data ? [data] : []);
        if (!cancelled) setRows(list);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Could not load applications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const openReport = (row: Application) => {
    setSelectedRow(row);
    setReportOpen(true);
  };

  const onDelete = async (user_cv_id: number) => {
if (!confirm("Are you sure you want to delete this application?")) return;
try {
const resp = await fetch(`${API_BASE_URL}/users/${user_cv_id}`, {
method: "DELETE",
headers: {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
},
});
if (!resp.ok) {
let msg = "Failed to delete application";
try { const j = await resp.json(); msg = j?.detail || msg; } catch {}
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
        <div className="rounded-lg border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">{error}</div>
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
                    <a href={r.cv_url} target="_blank" rel="noreferrer" className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300 hover:underline">
                      View CV
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => openReport(r)} className="rounded-lg border border-purple-800 px-3 py-1.5 hover:bg-gray-800">
                        View Report
                      </button>
                  <button onClick={() => onDelete(r.user_cv_id)} className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800/30 text-red-300 hover:text-red-200">
                  Delete
                  </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No applications yet.</td>
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

function ReportModal({ open, onClose, row }: { open: boolean; onClose: () => void; row: Application | null }) {
  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-900/50 bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 px-5 py-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-purple-300">Interview Report</div>
            <div className="text-lg font-semibold text-white">{row.name} · {row.job_position}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-gray-300 hover:bg-gray-800" aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-purple-600/20 px-2 py-1 text-purple-300">{row.job_type}</span>
            <span className="rounded-full bg-indigo-600/20 px-2 py-1 text-indigo-300">{row.job_position}</span>
            <a href={row.cv_url} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-600/20 px-2 py-1 text-emerald-300 hover:underline">View CV</a>
          </div>

          {/* Feedback card */}
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-5">
            <div className="mb-2 text-sm font-medium text-gray-200">AI Feedback</div>
            {row.feedback ? (
              <div className="prose prose-invert max-w-none text-sm leading-6 text-gray-300">
                {row.feedback}
              </div>
            ) : (
              <div className="text-sm text-gray-400">No feedback provided.</div>
            )}
          </div>

          {/* Fancy highlights (optional) */}
          {row.feedback && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Highlight title="Strengths" color="emerald" items={extractBullets(row.feedback, "strength")} />
              <Highlight title="Improvements" color="rose" items={extractBullets(row.feedback, "improve")} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-800 bg-gray-950 px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Close</button>
          <a href={row.cv_url} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open CV</a>
        </div>
      </div>
    </div>
  );
}

function Highlight({ title, color, items }: { title: string; color: "emerald" | "rose"; items: string[] }) {
  const colorBase = color === "emerald" ? "emerald" : "rose";
  return (
    <div className={`rounded-xl border border-${colorBase}-900/40 bg-${colorBase}-950/20 p-4`}> 
      <div className={`mb-2 text-sm font-semibold text-${colorBase}-200`}>{title}</div>
      {items.length > 0 ? (
        <ul className="list-disc pl-5 text-sm text-gray-300">
          {items.map((x, i) => (<li key={i} className="mb-1">{x}</li>))}
        </ul>
      ) : (
        <div className="text-sm text-gray-400">—</div>
      )}
    </div>
  );
}

// naive heuristic splitter to make the modal feel richer
function extractBullets(text?: string, kind: "strength" | "improve" = "strength"): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (kind === "strength") {
    return sentences.filter(s => /strong|good|excellent|solid|understanding|experience|skill/.test(s.toLowerCase())).slice(0, 5);
  } else {
    return sentences.filter(s => /lack|struggle|improve|gap|weak|better|depth/.test(s.toLowerCase())).slice(0, 5);
  }
}
