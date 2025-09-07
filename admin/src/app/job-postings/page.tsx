"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// --- Types ---
type Posting = {
  id: string;
  position: string;
  type: string; // human-readable type name for display
  typeId?: string; // selected job type id (for payloads)
};

type Mode = "create" | "edit";

type RawType = {
  id?: string | number;
  type_id?: string | number;
  name?: string;
};

type RawPosition = {
  id?: string | number;
  name?: string; // position name
  position?: string; // some backends use this key
  type_id?: string | number;
  type?: string | RawType; // could be a string name or embedded object
};

export default function JobPostingsPage() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [jobTypes, setJobTypes] = useState<{ id: string; name: string }[]>([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [draft, setDraft] = useState<Posting>({
    id: "",
    position: "",
    type: "",
    typeId: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ------- Helpers -------
  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token)
      throw new Error("You must be logged in to perform this action.");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  };

  const toStringId = (v: unknown) =>
    v === null || v === undefined ? undefined : String(v);

  const normalizeTypes = (types: RawType[]) => {
    // Build lookups by id and by lowercased name
    const byId = new Map<string, string>();
    const byName = new Map<string, string>();
    const list: { id: string; name: string }[] = [];
    types?.forEach((t) => {
      const id = toStringId(t.id ?? t.type_id);
      const name = (t.name ?? "").toString();
      if (id && name) {
        byId.set(id, name);
        byName.set(name.toLowerCase(), name);
        list.push({ id, name });
      }
    });
    return { byId, byName, list };
  };

  const normalizePositions = (
    positions: RawPosition[],
    typeLookup: { byId: Map<string, string>; byName: Map<string, string> }
  ): Posting[] => {
    return (positions || []).map((p) => {
      const id = toStringId(p.id) ?? crypto.randomUUID();
      const positionName = (p.name ?? p.position ?? "").toString();

      // Resolve type name & id from several possible shapes
      let typeName = "";
      let typeId: string | undefined = undefined;

      if (typeof p.type === "string") {
        typeName = p.type;
      } else if (p.type && typeof p.type === "object") {
        const tObj = p.type as RawType;
        typeName = (tObj.name ?? "").toString();
        typeId = toStringId(tObj.id ?? tObj.type_id);
      }

      if (!typeName) {
        const tid = toStringId(p.type_id);
        if (tid && typeLookup.byId.has(tid)) {
          typeName = typeLookup.byId.get(tid)!;
          typeId = tid;
        }
      }

      return { id, position: positionName, type: typeName, typeId } as Posting;
    });
  };

  // ------- Load types + positions -------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        setInitialLoading(true);
        const headers = getAuthHeaders();

        const [typesResp, posResp] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs/types`, { headers }),
          fetch(`${API_BASE_URL}/jobs/positions`, { headers }),
        ]);

        if (!typesResp.ok) {
          let msg = "Failed to fetch job types";
          try {
            const j = await typesResp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }
        if (!posResp.ok) {
          let msg = "Failed to fetch job positions";
          try {
            const j = await posResp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }

        const rawTypes = (await typesResp.json()) as RawType[];
        const rawPositions = (await posResp.json()) as RawPosition[];

        const lookup = normalizeTypes(rawTypes);
        const merged = normalizePositions(rawPositions, lookup).filter(
          (p) => p.position
        );

        if (!cancelled) {
          setJobTypes(lookup.list);
          setPostings(merged);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Could not load job postings.");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Open modal for Create
  const onCreate = () => {
    setMode("create");
    setDraft({ id: "", position: "", type: "", typeId: undefined });
    setOpen(true);
  };

  // Open modal for Edit
  const onEdit = (p: Posting) => {
    // If we have typeId missing but can infer from current jobTypes by name, fill it
    const inferredTypeId =
      p.typeId ||
      jobTypes.find(
        (t) => t.name.toLowerCase() === (p.type || "").toLowerCase()
      )?.id;
    setMode("edit");
    setDraft({ ...p, typeId: inferredTypeId });
    setOpen(true);
  };

  // Delete via backend
  const onDelete = async (id: string) => {
    try {
      setError(null);
      setDeletingId(id);
      const headers = getAuthHeaders();

      const resp = await fetch(
        `${API_BASE_URL}/jobs/positions/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!resp.ok) {
        let msg = "Failed to delete job post";
        try {
          const j = await resp.json();
          msg = j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      setPostings((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message || "Could not delete job post.");
    } finally {
      setDeletingId(null);
    }
  };

  // ------- Create/Update using selected type from dropdown -------
  const onSave = async () => {
    setError(null);
    if (!draft.position.trim() || !draft.typeId) return; // require a selected type

    try {
      setLoading(true);
      const headers = getAuthHeaders();

      if (mode === "edit") {
        const tid = draft.typeId ? Number(draft.typeId) : undefined;

        const payload: Record<string, any> = {
          name: draft.position.trim(), // ✅ backend expects `name`
        };
        if (tid !== undefined && !Number.isNaN(tid)) {
          payload.type_id = tid; // ✅ send number
        } else if (draft.type) {
          payload.type_name = draft.type.trim();
        }

        const resp = await fetch(
          `${API_BASE_URL}/jobs/positions/${encodeURIComponent(draft.id)}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          }
        );
        if (!resp.ok) {
          let msg = "Failed to update job post";
          try {
            const j = await resp.json();
            msg = j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }
        const data: any = await resp.json();
        const updated: Posting = {
          id: String(data?.id ?? draft.id),
          position: String(data?.name ?? draft.position),
          type:
            jobTypes.find((t) => t.id === draft.typeId!)?.name ||
            draft.type ||
            "",
          typeId: draft.typeId,
        };
        setPostings((prev) =>
          prev.map((p) => (p.id === draft.id ? updated : p))
        );
        setOpen(false);
        return;
      }

      // CREATE branch
      const tid = draft.typeId ? Number(draft.typeId) : undefined;
      const positionPayload: Record<string, any> = {
        name: draft.position.trim(),
      };
      if (tid !== undefined && !Number.isNaN(tid)) {
        positionPayload.type_id = tid; // ✅ number for backend
      } else if (draft.type) {
        positionPayload.type = draft.type.trim();
      }

      const posResp = await fetch(`${API_BASE_URL}/jobs/positions`, {
        method: "POST",
        headers,
        body: JSON.stringify(positionPayload),
      });

      if (!posResp.ok) {
        let msg = "Failed to create job position";
        try {
          const j = await posResp.json();
          msg = j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }
      const posData: any = await posResp.json();

      const newPosting: Posting = {
        id: toStringId(posData?.id) ?? String(Date.now()),
        position: (posData?.name ?? draft.position).toString(),
        type:
          jobTypes.find((t) => t.id === draft.typeId!)?.name ||
          draft.type ||
          "",
        typeId: draft.typeId,
      };

      setPostings((prev) => [newPosting, ...prev]);
      setOpen(false);
    } catch (e: any) {
      setError(
        e.message || "Something went wrong while saving the job posting."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reusable label/input classes
  const labelCls = "mb-1 block text-sm font-medium text-gray-300";
  const inputCls =
    "w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Job Posting</h2>
        <button
          onClick={onCreate}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Create Posting
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-800">
        {initialLoading ? (
          <div className="p-6 text-center text-gray-400">
            Loading job postings…
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Job-Position</th>
                <th className="px-4 py-3 text-left">Job-Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {postings.map((p) => (
                <tr key={p.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">{p.position}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                      {p.type || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="rounded-lg border border-purple-800 px-3 py-1.5 hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800/30 text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === p.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {postings.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No job postings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Create Posting" : "Edit Posting"}
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Job Position</label>
            <input
              className={inputCls}
              placeholder="e.g., Intern / Associate / Senior"
              value={draft.position}
              onChange={(e) =>
                setDraft((d) => ({ ...d, position: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Job Type</label>
            <select
              className={inputCls}
              value={draft.typeId || ""}
              onChange={(e) => {
                const selId = e.target.value || undefined; // string | undefined
                const selName =
                  jobTypes.find((t) => t.id === selId)?.name || "";
                setDraft((d) => ({ ...d, typeId: selId, type: selName })); // ✅ matches Posting.typeId?: string
              }}
            >
              <option value="" disabled>
                Select a job type…
              </option>
              {jobTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {jobTypes.length === 0 && (
              <p className="mt-2 text-xs text-gray-400">
                No job types found. Create job types first.
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading || !draft.position.trim() || !draft.typeId}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving…"
                : mode === "create"
                ? "Create"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* -------------------- Reusable Modal Component -------------------- */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h3>
          <button
            className="rounded-md p-2 text-gray-300 hover:bg-gray-800"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
