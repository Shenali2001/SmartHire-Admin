// export default function DashboardPage() {
//   return (
//     <div className="space-y-6">
//       {/* KPI Cards */}
//       <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//         <Card title="All Candidate " value="128"  />
//         <Card title="Total Applications " value="342"  />
//         <Card title="Total Job" value="219"  />
   
//       </section>

//       {/* Two columns */}
//       <section className="grid gap-6 lg:grid-cols-1">
//         {/* Recent Applications */}
//         <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-900">
//           <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
//             <h2 className="text-lg font-semibold">Recent Applications</h2>
//             <a href="/applications" className="text-xs text-indigo-400 hover:underline">
//               View all
//             </a>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-900/50">
//                 <tr className="text-gray-400">
//                   <th className="px-4 py-3 text-left font-medium">Applicant</th>
//                   <th className="px-4 py-3 text-left font-medium">Email</th>
//                   <th className="px-4 py-3 text-left font-medium">Job-Position</th>
//                   <th className="px-4 py-3 text-left font-medium">Job-Type</th>
//                     {/* <th className="px-4 py-3 text-left font-medium">Cv</th>
//                   <th className="px-4 py-3 text-left font-medium">Report</th> */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {[
//                   { name: "Ayesha Fernando", email:"Ayesha@gmail.com", position: "intern", jobType: "ML Engineer", cv: "Interviewed", report: "1h ago" },
//                   { name: "Liam Perera", email:"Ayesha@gmail.com", position: "intern",jobType: "Data Scientist", cv: "Pending", report: "3h ago" },
//                   { name: "Kavindu Jayasuriya", email:"Ayesha@gmail.com", position: "intern", jobType: "Backend Dev", cv: "Report Ready", report: "5h ago" },
//                   { name: "Nethmi Silva", email:"Ayesha@gmail.com", position: "intern", jobType: "Frontend Dev", cv: "Screening", report: "8h ago" },
//                 ].map((r) => (
//                   <tr key={r.name} className="border-t border-gray-800">
//                     <td className="px-4 py-3">{r.name}</td>
//                     <td className="px-4 py-3">{r.email}</td>
//                      <td className="px-4 py-3">{r.position}</td>
//                       <td className="px-4 py-3">{r.jobType}</td>
//                     {/* <td className="px-4 py-3">
//                       <span className="rounded-full bg-indigo-600/20 px-2 py-1 text-xs text-indigo-300">
//                         {r.cv}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-400">{r.report}</td> */}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </section>
//     </div>
//   );
// }

// function Card({ title, value, delta }: { title: string; value: string; delta?: string }) {
//   return (
//     <div className="rounded-2xl border border-purple-900 bg-gray-900 p-4 py-8">
//       <div className="text-xl text-gray-400">{title}</div>
//       <div className="mt-2 flex items-end justify-between">
//         <div className="text-2xl font-semibold">{value}</div>
//         {delta && <div className="text-xs text-emerald-400">{delta}</div>}
//       </div>
//     </div>
//   );
// }

// function Row({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
//       <span className="text-gray-400">{label}</span>
//       <span className="font-medium">{value}</span>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type StatsResponse = {
  candidate_users: number;
  applications: number;
  job_positions: number;
};

type RecentApplication = {
  user_cv_id: number;
  user_id: number;
  name: string;
  email: string;
  job_type: string;
  job_position: string;
  cv_url: string;
  created_at: string | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recent, setRecent] = useState<RecentApplication[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const token = useMemo(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem("access_token") || localStorage.getItem("token"))) ||
      null,
    []
  );

  // KPIs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetch(`${API_BASE_URL}/stats/overview`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!resp.ok) {
          let msg = "Failed to load stats";
          try {
            const j = await resp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }
        const data: StatsResponse = await resp.json();
        if (!cancelled) setStats(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Could not fetch stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Recent Applications
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setRecentLoading(true);
        const resp = await fetch(
          `${API_BASE_URL}/applications/recent?limit=5&offset=0`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!resp.ok) {
          let msg = "Failed to load recent applications";
          try {
            const j = await resp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await resp.json();
        const list: RecentApplication[] = Array.isArray(data)
          ? data
          : data
          ? [data]
          : [];
        if (!cancelled) setRecent(list);
      } catch (e: any) {
    
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const fmt = (n?: number) =>
    typeof n === "number" ? new Intl.NumberFormat().format(n) : "—";

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="All Candidates" value={fmt(stats?.candidate_users)} loading={loading} />
        <Card title="Total Applications" value={fmt(stats?.applications)} loading={loading} />
        <Card title="Total Jobs" value={fmt(stats?.job_positions)} loading={loading} />
      </section>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Recent Applications */}
      <section className="grid gap-6 lg:grid-cols-1">
        <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <a href="/applications" className="text-xs text-indigo-400 hover:underline">
              View all
            </a>
          </div>

          {recentLoading ? (
            <div className="p-6 text-center text-gray-400">Loading recent…</div>
          ) : recent.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No recent applications.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-900/50">
                  <tr className="text-gray-400">
                    <th className="px-4 py-3 text-left font-medium">Applicant</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Job-Position</th>
                    <th className="px-4 py-3 text-left font-medium">Job-Type</th>
                    <th className="px-4 py-3 text-left font-medium">CV</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  delta,
  loading,
}: {
  title: string;
  value: string;
  delta?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-purple-900 bg-gray-900 p-4 py-8">
      <div className="text-xl text-gray-400">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        {loading ? (
          <div className="h-7 w-16 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="text-2xl font-semibold">{value}</div>
        )}
        {delta && <div className="text-xs text-emerald-400">{delta}</div>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
