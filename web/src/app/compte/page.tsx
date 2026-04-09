"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi, authApi, uploadApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Reservation } from "@/types/models";
import {
  Hotel,
  Luggage,
  Calendar,
  Users,
  Heart,
  ClipboardList,
  UserCircle,
  Lock,
  Save,
  ChevronDown,
  XCircle,
  Camera,
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES = {
  pending: { label: "En attente", bg: "bg-or/10", text: "text-or" },
  confirmed: { label: "Confirmé", bg: "bg-vert/10", text: "text-vert" },
  cancelled: { label: "Annulé", bg: "bg-rouge/10", text: "text-rouge" },
  completed: { label: "Terminé", bg: "bg-gris/10", text: "text-gris" },
};

type Tab = "profil" | "reservations" | "owner-reservations";

export default function ComptePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, setAuth } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profil");

  // Profile edit state
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileMsg, setProfileMsg] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ["my-reservations"],
    queryFn: async () => (await reservationsApi.myReservations()).data,
    enabled: isAuthenticated(),
  });

  const { data: ownerReservations = [], isLoading: ownerLoading } = useQuery<
    Reservation[]
  >({
    queryKey: ["owner-reservations"],
    queryFn: async () => (await reservationsApi.ownerReservations()).data,
    enabled:
      isAuthenticated() && (user?.role === "owner" || user?.role === "admin"),
  });

  const qc = useQueryClient();
  const canManageStatus = user?.role === "owner" || user?.role === "admin";

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reservations"] });
      qc.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });

  const cancelReservation = useMutation({
    mutationFn: (id: number) => reservationsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-reservations"] }),
  });

  const handleProfileSave = async () => {
    setProfileMsg("");
    try {
      const res = await authApi.updateProfile({
        firstName,
        lastName,
        phone,
      });
      if (res.data) {
        setAuth(res.data, localStorage.getItem("accessToken") ?? "");
      }
      setProfileMsg("Profil mis à jour.");
    } catch {
      setProfileMsg("Erreur lors de la mise à jour.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setAvatarUploading(true);
    try {
      const uploadRes = await uploadApi.upload(file, "avatars");
      const avatarUrl = uploadRes.data?.url ?? uploadRes.data?.secure_url;
      if (avatarUrl) {
        const profileRes = await authApi.updateProfile({
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          phone: user?.phone ?? "",
          avatarUrl,
        });
        if (profileRes.data) {
          setAuth(profileRes.data, localStorage.getItem("accessToken") ?? "");
        }
        setProfileMsg("Photo de profil mise à jour.");
      }
    } catch {
      setProfileMsg("Erreur lors de l'upload de la photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwMsg("");
    if (!currentPassword) {
      setPwMsg("Veuillez saisir votre mot de passe actuel.");
      return;
    }
    if (newPassword.length < 10) {
      setPwMsg("Le nouveau mot de passe doit contenir au moins 10 caractères.");
      return;
    }
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPwMsg("Mot de passe mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setPwMsg("Mot de passe actuel incorrect.");
      } else {
        setPwMsg("Erreur lors du changement de mot de passe.");
      }
    }
  };

  if (!isAuthenticated()) return null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "profil",
      label: "Profil",
      icon: <UserCircle className="w-4 h-4" />,
    },
    {
      key: "reservations",
      label: "Réservations",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    ...(user?.role === "owner" || user?.role === "admin"
      ? [
          {
            key: "owner-reservations" as Tab,
            label: "Réservations reçues",
            icon: <Hotel className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 p-6 bg-sable rounded-card border border-sable-2">
          <div className="relative group">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-rouge text-blanc flex items-center justify-center font-serif text-xl">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            )}
            <label
              className="absolute inset-0 flex items-center justify-center rounded-full bg-nuit/50 text-blanc opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Changer la photo de profil"
            >
              {avatarUploading ? (
                <span className="text-xs">…</span>
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="sr-only"
                disabled={avatarUploading}
              />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-nuit">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gris text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blanc border border-sable-2 rounded-pill text-xs text-gris capitalize">
              {user?.role === "owner" ? (
                <span className="inline-flex items-center gap-1">
                  <Hotel className="w-3 h-3" /> Propriétaire
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Luggage className="w-3 h-3" /> Voyageur
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/favoris"
              className="px-4 py-2 text-sm text-gris border border-sable-2 rounded hover:border-rouge hover:text-rouge transition-colors inline-flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" /> Favoris
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="px-4 py-2 text-sm text-gris border border-sable-2 rounded hover:border-rouge hover:text-rouge transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-sable-2 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                tab === t.key
                  ? "border-rouge text-rouge"
                  : "border-transparent text-gris hover:text-nuit"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Profil */}
        {tab === "profil" && (
          <div className="space-y-8">
            {/* Edit profile */}
            <section className="p-6 border border-sable-2 rounded-card bg-blanc">
              <h2 className="font-serif text-xl text-nuit mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-rouge" />
                Informations personnelles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-nuit block mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-nuit block mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-nuit block mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+226 XX XX XX XX"
                    className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-nuit block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full px-3 py-2 border border-sable-2 rounded bg-sable text-gris text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              {profileMsg && (
                <p className="text-sm mt-3 text-vert">{profileMsg}</p>
              )}
              <button
                onClick={handleProfileSave}
                className="mt-4 px-5 py-2.5 bg-rouge hover:bg-rouge/90 text-blanc text-sm font-medium rounded transition-colors inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Enregistrer
              </button>
            </section>

            {/* Change password */}
            <section className="p-6 border border-sable-2 rounded-card bg-blanc">
              <h2 className="font-serif text-xl text-nuit mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rouge" />
                Changer le mot de passe
              </h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-medium text-nuit block mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-nuit block mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={10}
                    placeholder="Min. 10 caractères, 1 majuscule, 1 chiffre, 1 spécial"
                    className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                  />
                </div>
              </div>
              {pwMsg && (
                <p
                  className={`text-sm mt-3 ${pwMsg.includes("Erreur") ? "text-rouge" : "text-vert"}`}
                >
                  {pwMsg}
                </p>
              )}
              <button
                onClick={handlePasswordChange}
                className="mt-4 px-5 py-2.5 bg-nuit hover:bg-nuit/90 text-blanc text-sm font-medium rounded transition-colors inline-flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Modifier le mot de passe
              </button>
            </section>
          </div>
        )}

        {/* Tab: Reservations */}
        {tab === "reservations" && (
          <div>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-sable rounded-card animate-pulse"
                  />
                ))}
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-sable-2 rounded-card">
                <Hotel className="w-8 h-8 text-gris mx-auto mb-3" />
                <p className="text-gris">
                  Vous n&apos;avez aucune réservation pour le moment.
                </p>
                <Link
                  href="/reservation"
                  className="inline-block mt-4 px-5 py-2.5 bg-rouge text-blanc rounded font-medium hover:bg-rouge/90 transition-colors text-sm"
                >
                  Explorer les hébergements
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => {
                  const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
                  return (
                    <div
                      key={r.id}
                      className="p-5 border border-sable-2 rounded-card bg-blanc flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-nuit truncate">
                          {r.establishment?.place?.name ??
                            `Réservation #${r.id}`}
                        </h3>
                        <p className="text-xs text-gris mt-0.5 capitalize">
                          {r.establishment?.type} ·{" "}
                          {r.establishment?.place?.region?.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gris">
                          <span>
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            {new Date(r.checkInDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          {r.checkOutDate && (
                            <span>
                              →{" "}
                              {new Date(r.checkOutDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          )}
                          <span>
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            {r.guestsCount} pers.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {r.totalPriceFcfa > 0 && (
                          <span className="text-sm font-semibold text-vert">
                            {r.totalPriceFcfa.toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                        {canManageStatus ? (
                          <div className="relative inline-block">
                            <select
                              value={r.status}
                              onChange={(e) =>
                                updateStatus.mutate({
                                  id: r.id,
                                  status: e.target.value,
                                })
                              }
                              aria-label="Statut de la réservation"
                              className={`appearance-none pl-2.5 pr-7 py-1 rounded-pill text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-or ${st.bg} ${st.text}`}
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmé</option>
                              <option value="cancelled">Annulé</option>
                              <option value="completed">Terminé</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                          </div>
                        ) : (
                          <>
                            <span
                              className={`px-3 py-1 rounded-pill text-xs font-medium ${st.bg} ${st.text}`}
                            >
                              {st.label}
                            </span>
                            {r.status === "pending" && (
                              <button
                                onClick={() => {
                                  if (confirm("Annuler cette réservation ?")) {
                                    cancelReservation.mutate(r.id);
                                  }
                                }}
                                className="p-1.5 rounded hover:bg-rouge/10 text-gris hover:text-rouge transition-colors"
                                aria-label="Annuler la réservation"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Owner Reservations */}
        {tab === "owner-reservations" && (
          <div>
            {ownerLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-sable rounded-card animate-pulse"
                  />
                ))}
              </div>
            ) : ownerReservations.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-sable-2 rounded-card">
                <Hotel className="w-8 h-8 text-gris mx-auto mb-3" />
                <p className="text-gris">
                  Aucune réservation reçue pour vos établissements.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ownerReservations.map((r) => {
                  const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
                  return (
                    <div
                      key={r.id}
                      className="p-5 border border-sable-2 rounded-card bg-blanc flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-nuit truncate">
                          {r.establishment?.place?.name ??
                            `Réservation #${r.id}`}
                        </h3>
                        <p className="text-xs text-gris mt-0.5">
                          Client : {r.user?.firstName} {r.user?.lastName} ·{" "}
                          {r.user?.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gris">
                          <span>
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            {new Date(r.checkInDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          {r.checkOutDate && (
                            <span>
                              →{" "}
                              {new Date(r.checkOutDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          )}
                          <span>
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            {r.guestsCount} pers.
                          </span>
                        </div>
                        {r.specialRequests && (
                          <p className="text-xs text-gris mt-1 italic">
                            « {r.specialRequests} »
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {r.totalPriceFcfa > 0 && (
                          <span className="text-sm font-semibold text-vert">
                            {r.totalPriceFcfa.toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                        <div className="relative inline-block">
                          <select
                            value={r.status}
                            onChange={(e) =>
                              updateStatus.mutate({
                                id: r.id,
                                status: e.target.value,
                              })
                            }
                            aria-label="Statut de la réservation"
                            className={`appearance-none pl-2.5 pr-7 py-1 rounded-pill text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-or ${st.bg} ${st.text}`}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="cancelled">Annulé</option>
                            <option value="completed">Terminé</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
