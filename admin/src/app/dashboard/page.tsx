export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="All Users " value="128"  />
        <Card title="Total Applications " value="342"  />
        <Card title="Total Job" value="219"  />
   
      </section>

      {/* Two columns */}
      <section className="grid gap-6 lg:grid-cols-1">
        {/* Recent Applications */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <a href="/applications" className="text-xs text-indigo-400 hover:underline">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900/50">
                <tr className="text-gray-400">
                  <th className="px-4 py-3 text-left font-medium">Applicant</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Job-Position</th>
                  <th className="px-4 py-3 text-left font-medium">Job-Type</th>
                    <th className="px-4 py-3 text-left font-medium">Cv</th>
                  <th className="px-4 py-3 text-left font-medium">Report</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Ayesha Fernando", email:"Ayesha@gmail.com", position: "intern", jobType: "ML Engineer", cv: "Interviewed", report: "1h ago" },
                  { name: "Liam Perera", email:"Ayesha@gmail.com", position: "intern",jobType: "Data Scientist", cv: "Pending", report: "3h ago" },
                  { name: "Kavindu Jayasuriya", email:"Ayesha@gmail.com", position: "intern", jobType: "Backend Dev", cv: "Report Ready", report: "5h ago" },
                  { name: "Nethmi Silva", email:"Ayesha@gmail.com", position: "intern", jobType: "Frontend Dev", cv: "Screening", report: "8h ago" },
                ].map((r) => (
                  <tr key={r.name} className="border-t border-gray-800">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                     <td className="px-4 py-3">{r.position}</td>
                      <td className="px-4 py-3">{r.jobType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-600/20 px-2 py-1 text-xs text-indigo-300">
                        {r.cv}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{r.report}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  );
}

function Card({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 py-8">
      <div className="text-xl text-gray-400">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold">{value}</div>
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
