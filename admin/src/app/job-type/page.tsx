"use client";

import React, { useEffect, useState } from "react";

// --- Configure these for your environment ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

function withAuth(
  token: string | null,
  base: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = { ...base };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// Type definitions for API data
interface JobType {
  id: number;
  name: string;
}

export default function ApplicationsPage() {
  const [token, setToken] = useState<string | null>(null);

  const [rows, setRows] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  async function fetchTypes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/types`, {
        method: "GET",
        headers: withAuth(token, { Accept: "application/json" }),
      });
      if (!res.ok) throw new Error(`GET /jobs/types failed (${res.status})`);
      const data = await res.json();
      const list: JobType[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setRows(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load job types");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAdd() {
    if (!nameInput.trim() || !token) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/types`, {
        method: "POST",
        headers: withAuth(token, {
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (!res.ok) throw new Error(`POST /jobs/types failed (${res.status})`);
      const created = await res.json();
      if (created?.id) {
        setRows((prev) => [{ id: created.id, name: created.name }, ...prev]);
      } else {
        await fetchTypes();
      }
      setNameInput("");
    } catch (e: any) {
      setError(e?.message || "Failed to create job type");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Delete this job type?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/types/${id}`, {
        method: "DELETE",
        headers: withAuth(token, { Accept: "*/*" }),
      });
      if (!res.ok) throw new Error(`DELETE /jobs/types/${id} failed (${res.status})`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete job type");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(row: JobType) {
    setEditingId(row.id);
    setEditName(row.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEditRow() {
    if (editingId == null || !token) return;
    if (!editName.trim()) return;
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/types/${editingId}`, {
        method: "PUT",
        headers: withAuth(token, {
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error(`PUT /jobs/types/${editingId} failed (${res.status})`);
      const updated = await res.json();
      setRows((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, name: updated?.name ?? editName.trim() } : r))
      );
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || "Failed to update job type");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Job Types</h2>

      </header>

      <div className="flex items-center gap-3 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter Job Type"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={creating || !nameInput.trim() || !token}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Adding..." : "Add"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Job Type</th>
              <th className="px-4 py-3 text-right w-56">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-gray-400" colSpan={2}>Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-400" colSpan={2}>No job types yet.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-800">
                  <td className="px-4 py-3 align-middle">
                    {editingId === r.id ? (
                      <input
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span>{r.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      {editingId === r.id ? (
                        <>
                          <button
                            onClick={saveEditRow}
                            disabled={savingEdit || !editName.trim() || !token}
                            className="rounded-lg border border-emerald-700 px-3 py-1.5 hover:bg-emerald-800/30 text-emerald-300 hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-gray-800 px-3 py-1.5 hover:bg-gray-800"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(r)}
                            className="rounded-lg border border-gray-800 px-3 py-1.5 hover:bg-gray-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id || !token}
                            className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800/30 text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === r.id ? "Deleting..." : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
}
