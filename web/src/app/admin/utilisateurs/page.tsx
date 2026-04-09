"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { User, UserRole } from "@/types/models";
import { Users, Shield, Trash2, ChevronDown } from "lucide-react";

const ROLE_STYLES: Record<string, { label: string; bg: string; text: string }> =
  {
    admin: { label: "Admin", bg: "bg-rouge/10", text: "text-rouge" },
    owner: { label: "Propriétaire", bg: "bg-or/10", text: "text-or" },
    tourist: { label: "Voyageur", bg: "bg-vert/10", text: "text-vert" },
  };

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery<{
    data: User[];
    total: number;
  }>({
    queryKey: ["admin-users", page],
    queryFn: async () => (await adminApi.listUsers({ page, limit })).data,
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleRoleChange = (userId: number, newRole: string) => {
    if (confirm("Changer le rôle de cet utilisateur ?")) {
      updateRole.mutate({ id: userId, role: newRole });
    }
  };

  const handleDelete = (userId: number, email: string) => {
    if (
      confirm(
        `Supprimer l'utilisateur ${email} ? Cette action est irréversible.`,
      )
    ) {
      deleteUser.mutate(userId);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-6 h-6 text-or" />
        <h1 className="font-serif text-2xl text-nuit">Utilisateurs</h1>
        <span className="text-sm text-gris ml-2">({total})</span>
      </div>

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sable text-left">
              <th className="px-4 py-3 font-medium text-gris">Nom</th>
              <th className="px-4 py-3 font-medium text-gris">Email</th>
              <th className="px-4 py-3 font-medium text-gris">Rôle</th>
              <th className="px-4 py-3 font-medium text-gris">Inscrit le</th>
              <th className="px-4 py-3 font-medium text-gris w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sable-2">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-4 bg-sable rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : users.map((u) => {
                  const rs = ROLE_STYLES[u.role] ?? ROLE_STYLES.tourist;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-or/20 flex items-center justify-center text-or text-xs font-bold">
                            {u.firstName?.[0] ?? "?"}
                          </div>
                          <span className="text-nuit font-medium">
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gris">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            aria-label={`Rôle de ${u.firstName} ${u.lastName}`}
                            className={`appearance-none pl-2.5 pr-7 py-1 rounded-pill text-xs font-medium ${rs.bg} ${rs.text} border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-or`}
                          >
                            <option value="tourist">Voyageur</option>
                            <option value="owner">Propriétaire</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gris">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          className="p-1.5 rounded hover:bg-rouge/10 text-gris hover:text-rouge transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                page === p ? "bg-rouge text-blanc" : "text-gris hover:bg-sable"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
