export default function ApplicationsPage() {
  const rows = [
    { applicant: "Ayesha Fernando", email: "Ayesha@gmail.com", position : "intern", jobType: "ML Engineer", cv: "ayesha_cv.pdf" },
    { applicant: "Liam Perera", email: "Ayesha@gmail.com", position : "intern",  jobType: "Data Scientist", cv: "liam_cv.pdf" },
    { applicant: "Nethmi Silva", email: "Ayesha@gmail.com", position : "intern", jobType: "Frontend Dev", cv: "nethmi_cv.pdf" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Applications</h2>
        {/* <div className="flex gap-2">
          <input
            placeholder="Search applicant..."
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Filter
          </button>
        </div> */}
      </header>

      <div className="overflow-x-auto rounded-2xl border border-gray-800">
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
              <tr key={r.applicant} className="border-t border-gray-800">
                <td className="px-4 py-3">{r.applicant}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.position}</td>
                <td className="px-4 py-3">{r.jobType}</td>
                 <td className="px-4 py-3">
                  <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300">
                    {r.cv}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
               
                    <button className="rounded-lg border border-purple-800 px-3 py-1.5 hover:bg-gray-800">
                      View Report
                    </button>
                     <button className="rounded-lg border border-red-800 px-3 py-1.5 hover:bg-red-800">
                     Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
