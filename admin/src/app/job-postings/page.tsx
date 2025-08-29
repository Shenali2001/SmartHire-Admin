// "use client";

// import { useState } from "react";

// type Posting = {
//   id: string;
//   position: string;
//   type: string;

// };

// export default function JobPostingsPage() {
//   const [postings, setPostings] = useState<Posting[]>([
//     { id: "1", position: "Software Engineer", type: "Frontend"  },
//     { id: "2", position: "Data Scientist", type: "Full-Analytics" },
//   ]);

//   return (
//     <div className="space-y-6">
//       <header className="flex flex-wrap items-center justify-between gap-3">
//         <h2 className="text-lg font-semibold">Job Posting</h2>
//         <button className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700">
//           Create Posting
//         </button>
//       </header>

//       <div className="overflow-x-auto rounded-2xl border border-gray-800">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-900 text-gray-300">
//             <tr>
//               <th className="px-4 py-3 text-left">Job-Position</th>
//               <th className="px-4 py-3 text-left">Job-Type</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {postings.map((p) => (
//               <tr key={p.id} className="border-t border-gray-800">
//                 <td className="px-4 py-3">{p.position}</td>
//                    <td className="px-4 py-3">
//                   <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{p.type}</span>
//                 </td>
         
       
//                 <td className="px-4 py-3 text-right">
//                   <div className="inline-flex gap-2">
//                     <button className="rounded-lg border border-purple-800 px-3 py-1.5 hover:bg-gray-800">
//                       Edit
//                     </button>
//                       <button className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800">
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

type Posting = {
  id: string;
  position: string;
  type: string;
};

type Mode = "create" | "edit";

export default function JobPostingsPage() {
  const [postings, setPostings] = useState<Posting[]>([
    { id: "1", position: "Software Engineer", type: "Frontend" },
    { id: "2", position: "Data Scientist", type: "Full-Analytics" },
  ]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [draft, setDraft] = useState<Posting>({ id: "", position: "", type: "" });

  // Open modal for Create
  const onCreate = () => {
    setMode("create");
    setDraft({ id: "", position: "", type: "" });
    setOpen(true);
  };

  // Open modal for Edit
  const onEdit = (p: Posting) => {
    setMode("edit");
    setDraft({ ...p });
    setOpen(true);
  };

  // Delete
  const onDelete = (id: string) => {
    setPostings((prev) => prev.filter((p) => p.id !== id));
  };

  // Save (Create or Edit)
  const onSave = () => {
    if (!draft.position.trim() || !draft.type.trim()) return;

    if (mode === "create") {
      const newPosting: Posting = {
        id: String(Date.now()),
        position: draft.position.trim(),
        type: draft.type.trim(),
      };
      setPostings((prev) => [newPosting, ...prev]);
    } else {
      setPostings((prev) =>
        prev.map((p) => (p.id === draft.id ? { ...p, position: draft.position.trim(), type: draft.type.trim() } : p))
      );
    }
    setOpen(false);
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

      <div className="overflow-x-auto rounded-2xl border border-gray-800">
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
                  <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{p.type}</span>
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
                      className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800/30 text-red-300 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {postings.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No job postings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={mode === "create" ? "Create Posting" : "Edit Posting"}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Job Position</label>
            <input
              className={inputCls}
              placeholder="e.g., Software Engineer"
              value={draft.position}
              onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Job Type</label>
            {/* Keep as text input per your request; swap to a <select> if you prefer */}
            <input
              className={inputCls}
              placeholder="e.g., Frontend / Backend / Internship / Contract"
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            />
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
              disabled={!draft.position.trim() || !draft.type.trim()}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === "create" ? "Create" : "Save Changes"}
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
  // Close on ESC
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
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
