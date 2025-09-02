// "use client";

// import { useState } from "react";

// type UserRow = {
//   id: string;
//   name: string;
//   email: string;
//   phoneNum: string;
//   role: "admin" | "user";


// };

// export default function UsersPage() {
//   const [users, setUsers] = useState<UserRow[]>([
//     { id: "u1", name: "Admin", email: "admin@example.com", phoneNum: "0785623502" ,role: "admin"},
//     { id: "u2", name: "Dasun", email: "dasun@example.com", phoneNum: "0785623502" ,role: "user" },
//   ]);

//   return (
//     <div className="space-y-6">
//       <header className="flex items-center justify-between">
//         <h2 className="text-2xl font-semibold">Users</h2>
//         {/* <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
//           Invite User
//         </button> */}
//       </header>

//       <div className="overflow-x-auto rounded-2xl border border-gray-800">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-900 text-gray-300">
//             <tr>
//               <th className="px-4 py-3 text-left">Name</th>
//               <th className="px-4 py-3 text-left">Email</th>
//               <th className="px-4 py-3 text-left">Phone Num</th>
//               <th className="px-4 py-3 text-left">Role</th>
      
        
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((u) => (
//               <tr key={u.id} className="border-t border-gray-800">
//                 <td className="px-4 py-3">{u.name}</td>
//                 <td className="px-4 py-3">{u.email}</td>
//                 <td className="px-4 py-3">{u.phoneNum}</td>
//                 <td className="px-4 py-3">
//                   <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{u.role}</span>
//                 </td>
           
//                 <td className="px-4 py-3 text-right">
//                   <div className="inline-flex gap-2">
//                     <button className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800">
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type CandidateItem = {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  created_at: string; // ISO
  applications: number;
};

type CandidatesResp = {
  items: CandidateItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export default function UsersPage() {
  const [rows, setRows] = useState<CandidateItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = useMemo(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem("access_token") ||
          localStorage.getItem("token"))) ||
      null,
    []
  );

  const fetchCandidates = async (p = 1) => {
    setError(null);
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/admin/candidates?page=${p}&page_size=${pageSize}&sort_by=created_at&sort_dir=desc`;
      const resp = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) {
        let msg = "Failed to load candidates";
        try {
          const j = await resp.json();
          msg = j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }
      const data: CandidatesResp = await resp.json();
      setRows(data.items || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (e: any) {
      setError(e.message || "Could not fetch candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onDelete = async (userId: number) => {
    const confirm = window.confirm(
      "Delete this candidate (and possibly their data)? This cannot be undone."
    );
    if (!confirm) return;

    try {
      setError(null);
      setDeletingId(userId);
      const resp = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) {
        let msg = "Failed to delete candidate";
        try {
          const j = await resp.json();
          msg = j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }
      // Optimistic remove
      setRows((prev) => prev.filter((r) => r.id !== userId));
    } catch (e: any) {
      setError(e.message || "Could not delete candidate.");
    } finally {
      setDeletingId(null);
    }
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Users</h2>
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Applications</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone_number}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300">
                      {u.applications}
                    </span>
                  </td>
                  <td className="px-4 py-3">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onDelete(u.id)}
                        disabled={deletingId === u.id}
                        className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800/30 text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === u.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Page {page} of {pages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const next = Math.max(1, page - 1);
              setPage(next);
              fetchCandidates(next);
            }}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-gray-800 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => {
              const next = Math.min(pages, page + 1);
              setPage(next);
              fetchCandidates(next);
            }}
            disabled={page >= pages || loading}
            className="rounded-lg border border-gray-800 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
