"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phoneNum: string;
  role: "admin" | "user";


};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([
    { id: "u1", name: "Admin", email: "admin@example.com", phoneNum: "0785623502" ,role: "admin"},
    { id: "u2", name: "Dasun", email: "dasun@example.com", phoneNum: "0785623502" ,role: "user" },
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Users</h2>
        {/* <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Invite User
        </button> */}
      </header>

      <div className="overflow-x-auto rounded-2xl border border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone Num</th>
              <th className="px-4 py-3 text-left">Role</th>
      
        
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phoneNum}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{u.role}</span>
                </td>
           
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
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
