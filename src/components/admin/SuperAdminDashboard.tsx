import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Users, UserPlus, Lock, Key, ShieldAlert, CheckCircle, 
  Search, RefreshCw, LogOut, ArrowRight, LayoutDashboard, Database,
  Settings, Filter, UserCheck, Eye, Compass, Layers, Activity, AlertCircle, Edit3, Trash2
} from "lucide-react";
import { SystemUser, Role } from "../../types";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../services/api";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import PageHeader from "../ui/PageHeader";
import Sidebar from "../ui/Sidebar";
import PageTransition from "../ui/PageTransition";

interface SuperAdminDashboardProps {
  onLogout: () => void;
  onSwitchRole?: (role: Role, identifier: string) => void;
}

const DEFAULT_SYSTEM_USERS: SystemUser[] = [
  {
    id: "usr_superadmin",
    dni: "00000000",
    email: "admin@iestpsfa.edu.pe",
    displayName: "Administrador General",
    lastName: "del Sistema",
    phone: "999000000",
    role: "superadmin",
    assignedModule: "Administración del Sistema",
    status: "Activo",
    createdAt: "2026-01-01"
  },
  {
    id: "usr_mamc",
    dni: "11112222",
    email: "mamc@iestpsfa.edu.pe",
    displayName: "Director MAMC",
    lastName: "Admisión & Matrícula",
    phone: "999111222",
    role: "administrador",
    assignedModule: "MAMC - Admisión y Matrícula",
    status: "Activo",
    createdAt: "2026-01-10"
  },
  {
    id: "usr_mpa",
    dni: "22223333",
    email: "mpa@iestpsfa.edu.pe",
    displayName: "Coordinador MPA",
    lastName: "Planificación Académica",
    phone: "999222333",
    role: "mpa",
    assignedModule: "MPA - Planificación Académica",
    status: "Activo",
    createdAt: "2026-01-12"
  },
  {
    id: "usr_mge",
    dni: "33334444",
    email: "mge@iestpsfa.edu.pe",
    displayName: "Secretario MGE",
    lastName: "Gestión Estudiantil",
    phone: "999333444",
    role: "mge",
    assignedModule: "MGE - Gestión de Estudiantes",
    status: "Activo",
    createdAt: "2026-01-15"
  },
  {
    id: "usr_maf",
    dni: "44445555",
    email: "maf@iestpsfa.edu.pe",
    displayName: "Jefe de Caja MAF",
    lastName: "Finanzas & Tesorería",
    phone: "999444555",
    role: "maf",
    assignedModule: "MAF - Administración y Finanzas",
    status: "Activo",
    createdAt: "2026-01-18"
  },
  {
    id: "usr_docente",
    dni: "99887766",
    email: "mramos@iestpsfa.edu.pe",
    displayName: "Manuel",
    lastName: "Ramos Salazar",
    phone: "998877661",
    role: "docente",
    assignedModule: "Intranet Docente",
    status: "Activo",
    createdAt: "2026-02-01"
  }
];

export default function SuperAdminDashboard({ onLogout, onSwitchRole }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"usuarios" | "matriz" | "auditoria">("usuarios");
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem("sfa_system_users");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SYSTEM_USERS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State for New User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    role: "administrador" as Role,
    assignedModule: "MAMC - Admisión y Matrícula",
    password: "123",
    status: "Activo" as const
  });

  // Load from Backend REST API on mount
  useEffect(() => {
    setIsLoading(true);
    fetchUsers().then((apiUsers) => {
      if (apiUsers && apiUsers.length > 0) {
        setUsers((prev) => {
          const merged = [...prev];
          apiUsers.forEach((au) => {
            const idx = merged.findIndex((m) => m.dni === au.dni || m.email === au.email || m.id === au.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...au };
            } else {
              merged.push(au);
            }
          });
          localStorage.setItem("sfa_system_users", JSON.stringify(merged));
          return merged;
        });
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("Error fetching REST API system users:", err);
      setIsLoading(false);
    });
  }, []);

  const saveUsersState = (newList: SystemUser[]) => {
    setUsers(newList);
    try {
      localStorage.setItem("sfa_system_users", JSON.stringify(newList));
    } catch (e) {}
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      dni: "",
      name: "",
      lastName: "",
      email: "",
      phone: "",
      role: "administrador",
      assignedModule: "MAMC - Admisión y Matrícula",
      password: "123",
      status: "Activo"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (usr: SystemUser) => {
    setEditingUser(usr);
    setFormData({
      dni: usr.dni,
      name: usr.displayName.split(" ")[0] || usr.displayName,
      lastName: usr.lastName || "",
      email: usr.email,
      phone: usr.phone || "",
      role: usr.role,
      assignedModule: usr.assignedModule || "MAMC",
      password: usr.password || "123",
      status: usr.status
    });
    setIsModalOpen(true);
  };

  const handleRoleSelectChange = (role: Role) => {
    let moduleName = "MAMC - Admisión y Matrícula";
    if (role === "mpa") moduleName = "MPA - Planificación Académica";
    else if (role === "mge") moduleName = "MGE - Gestión de Estudiantes";
    else if (role === "maf") moduleName = "MAF - Administración y Finanzas";
    else if (role === "docente") moduleName = "Intranet Docente";
    else if (role === "alumno") moduleName = "Intranet Alumno";
    else if (role === "postulante") moduleName = "Portal Postulante";
    else if (role === "superadmin") moduleName = "Administración del Sistema";

    setFormData((prev) => ({ ...prev, role, assignedModule: moduleName }));
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dni || !formData.name || !formData.email) {
      alert("Por favor complete los campos obligatorios: DNI, Nombre y Correo Institucional.");
      return;
    }

    setIsSubmitting(true);
    const fullName = `${formData.name} ${formData.lastName}`.trim();

    if (editingUser) {
      const updated: SystemUser = {
        ...editingUser,
        dni: formData.dni,
        displayName: fullName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        assignedModule: formData.assignedModule,
        password: formData.password,
        status: formData.status
      };

      const newList = users.map((u) => (u.id === editingUser.id ? updated : u));
      saveUsersState(newList);
      await updateUser(editingUser.id, updated).catch(err => console.error("Error updating user in API:", err));
      alert(`Usuario ${fullName} actualizado correctamente.`);
    } else {
      const newUser: SystemUser = {
        id: `usr_${Date.now()}`,
        dni: formData.dni,
        displayName: fullName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        assignedModule: formData.assignedModule,
        status: formData.status,
        password: formData.password,
        createdAt: new Date().toISOString().split("T")[0]
      };

      const newList = [newUser, ...users];
      saveUsersState(newList);
      await createUser(newUser).catch(err => console.error("Error creating user in API:", err));
      alert(`¡Nuevo Gestor/Usuario ${fullName} registrado con éxito en el sistema!`);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (usr: SystemUser) => {
    const nextStatus = usr.status === "Activo" ? "Bloqueado" : "Activo";
    const updated = { ...usr, status: nextStatus as any };
    const newList = users.map((u) => (u.id === usr.id ? updated : u));
    saveUsersState(newList);
    await updateUser(usr.id, updated).catch(err => console.error("Error updating status in API:", err));
  };

  const handleDeleteUser = async (usr: SystemUser) => {
    if (usr.role === "superadmin" && users.filter((u) => u.role === "superadmin").length <= 1) {
      alert("No se puede eliminar el único Super Administrador del sistema.");
      return;
    }
    if (window.confirm(`¿Está seguro de eliminar al usuario ${usr.displayName}?`)) {
      const newList = users.filter((u) => u.id !== usr.id);
      saveUsersState(newList);
      await deleteUser(usr.id).catch(err => console.error("Error deleting user in API:", err));
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.displayName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.dni.includes(query);

    if (!matchesSearch) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "superadmin":
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-black text-[10px] uppercase rounded-md border border-purple-200">Super Admin</span>;
      case "administrador":
        return <span className="px-2.5 py-1 bg-rose-100 text-[#9F062A] font-black text-[10px] uppercase rounded-md border border-rose-200">Gestor MAMC</span>;
      case "mpa":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-black text-[10px] uppercase rounded-md border border-blue-200">Gestor MPA</span>;
      case "mge":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase rounded-md border border-emerald-200">Gestor MGE</span>;
      case "maf":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-[10px] uppercase rounded-md border border-amber-200">Gestor MAF</span>;
      case "docente":
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 font-black text-[10px] uppercase rounded-md border border-indigo-200">Docente</span>;
      case "alumno":
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-900 font-black text-[10px] uppercase rounded-md border border-teal-200">Alumno</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-black text-[10px] uppercase rounded-md border border-slate-200">Postulante</span>;
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row pb-0">
      {/* Sidebar */}
      <Sidebar
        institution={{
          name: "SFA SUPERADMIN",
          subtitle: "Gestión de Usuarios & Accesos"
        }}
        user={{
          name: "Super Administrador",
          role: "Control Total de Accesos",
          status: "SUPERADMIN",
        }}
        sections={[
          {
            title: "ADMINISTRACIÓN DEL SISTEMA",
            items: [
              {
                label: "Gestión de Usuarios",
                icon: <Users className="w-4 h-4" />,
                route: "usuarios",
                active: activeTab === "usuarios"
              },
              {
                label: "Matriz de Roles (RBAC)",
                icon: <Layers className="w-4 h-4" />,
                route: "matriz",
                active: activeTab === "matriz"
              },
              {
                label: "Auditoría & Logs",
                icon: <Activity className="w-4 h-4" />,
                route: "auditoria",
                active: activeTab === "auditoria"
              }
            ]
          }
        ]}
        onItemClick={(r) => setActiveTab(r as any)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-100/60 p-4 lg:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#CFA020]" />
              <h1 className="text-xl font-black uppercase tracking-wider text-white">Módulo de Administración General del Sistema</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Control centralizado de usuarios institucionales, roles de gestores (MAMC, MPA, MGE, MAF, Docentes) y permisos de acceso en MongoDB REST API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenCreateModal}
              className="bg-[#9F062A] hover:bg-[#800421] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Gestor / Usuario
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Total Usuarios</span>
            <span className="text-2xl font-black text-slate-900 block">{users.length}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-[#9F062A] tracking-wider block">Gestores MAMC</span>
            <span className="text-2xl font-black text-[#9F062A] block">{users.filter(u => u.role === "administrador").length}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">Gestores MPA</span>
            <span className="text-2xl font-black text-blue-900 block">{users.filter(u => u.role === "mpa").length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider block">Gestores MGE</span>
            <span className="text-2xl font-black text-emerald-900 block">{users.filter(u => u.role === "mge").length}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">Gestores MAF</span>
            <span className="text-2xl font-black text-amber-900 block">{users.filter(u => u.role === "maf").length}</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider block">Docentes</span>
            <span className="text-2xl font-black text-indigo-900 block">{users.filter(u => u.role === "docente").length}</span>
          </div>
        </div>

        {/* TAB 1: GESTIÓN DE USUARIOS */}
        {activeTab === "usuarios" && (
          <PageTransition id="usuarios" className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar usuario por Nombre, DNI o Correo Institucional..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500">Rol:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#9F062A]"
                  >
                    <option value="all">TODOS LOS ROLES</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="administrador">Gestor MAMC</option>
                    <option value="mpa">Gestor MPA</option>
                    <option value="mge">Gestor MGE</option>
                    <option value="maf">Gestor MAF</option>
                    <option value="docente">Docente</option>
                    <option value="alumno">Alumno</option>
                    <option value="postulante">Postulante</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500">Estado:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#9F062A]"
                  >
                    <option value="all">TODOS LOS ESTADOS</option>
                    <option value="Activo">Activos</option>
                    <option value="Bloqueado">Bloqueados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader className="bg-slate-900 text-white py-3.5 px-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-white">Directorio Institucional de Usuarios ({filteredUsers.length})</CardTitle>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Base de Datos: MongoDB / REST API</span>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Usuario / Nombre Completo</th>
                      <th className="py-3 px-4">DNI</th>
                      <th className="py-3 px-4">Correo Institucional</th>
                      <th className="py-3 px-4">Rol Asignado</th>
                      <th className="py-3 px-4">Módulo Asignado</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                          No se encontraron usuarios registrados que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {usr.displayName} {usr.lastName || ""}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{usr.dni}</td>
                          <td className="py-3.5 px-4 text-slate-600">{usr.email}</td>
                          <td className="py-3.5 px-4">{getRoleBadge(usr.role)}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700 text-[11px]">{usr.assignedModule}</td>
                          <td className="py-3.5 px-4">
                            {usr.status === "Activo" ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase rounded-full">Activo</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] uppercase rounded-full">Bloqueado</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick Switch Button */}
                              {onSwitchRole && usr.role !== "superadmin" && (
                                <button
                                  onClick={() => onSwitchRole(usr.role, usr.role === "administrador" ? "mamc" : usr.role === "docente" ? "docente" : usr.role)}
                                  title="Simular/Ir al Módulo de este Usuario"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all cursor-pointer"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(usr)}
                                title="Editar Usuario"
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(usr)}
                                title={usr.status === "Activo" ? "Bloquear Usuario" : "Activar Usuario"}
                                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                  usr.status === "Activo" ? "bg-amber-50 hover:bg-amber-100 text-amber-800" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(usr)}
                                title="Eliminar Usuario"
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </PageTransition>
        )}

        {/* TAB 2: MATRIZ DE PERMISOS & ROLES */}
        {activeTab === "matriz" && (
          <PageTransition id="matriz" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-900 text-white py-4 px-6 rounded-t-xl">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-white">Matriz de Roles y Permisos Institucionales (RBAC)</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Resumen de accesos y responsabilidades asignadas a cada gestor y usuario del sistema SFA.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-900" />
                      <h4 className="text-xs font-black uppercase text-purple-900">Super Administrador</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Control total del sistema. Crea y administra gestores MAMC, MPA, MGE, MAF y Docentes. Gestiona auditorías y permisos globales.
                    </p>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#9F062A]" />
                      <h4 className="text-xs font-black uppercase text-[#9F062A]">Gestor MAMC</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Módulo de Admisión y Matrícula. Apertura periodos de admisión, revisa requisitos, programa exámenes y matricula ingresantes.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-900" />
                      <h4 className="text-xs font-black uppercase text-blue-900">Gestor MPA</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Módulo de Planificación Académica. Crea mallas curriculares, asignaturas/cursos por carrera, turnos, asignación de aulas y horarios.
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-900" />
                      <h4 className="text-xs font-black uppercase text-emerald-900">Gestor MGE</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Módulo de Gestión de Estudiantes. Control escolar, ficha médica, historial académico y seguimiento de matriculados.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-900" />
                      <h4 className="text-xs font-black uppercase text-amber-900">Gestor MAF</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Módulo de Administración y Finanzas. Configuración de aranceles, caja, comprobantes, exoneraciones y becas.
                    </p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-indigo-900" />
                      <h4 className="text-xs font-black uppercase text-indigo-900">Docente</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Intranet Docente. Registro de asistencia de alumnos, evaluaciones/notas, carga de sílabos y publicación de evidencias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}

        {/* TAB 3: AUDITORÍA & LOGS */}
        {activeTab === "auditoria" && (
          <PageTransition id="auditoria" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-900 text-white py-4 px-6 rounded-t-xl">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-white">Registro de Auditoría de Accesos y Cambios de Roles</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900">Inicio de sesión exitoso como Super Admin</span>
                      <p className="text-[10px] text-slate-500">Usuario admin@iestpsfa.edu.pe accedió al Módulo de Gestión de Usuarios.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Hoy, 10:14 AM</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900">Sincronización con MongoDB REST API completada</span>
                      <p className="text-[10px] text-slate-500">Directorio de usuarios sincronizado con la colección 'users'.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Hoy, 10:10 AM</span>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}

      </main>

      {/* MODAL REGISTRAR / EDITAR USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#CFA020]" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {editingUser ? "Editar Usuario Institucional" : "Registrar Nuevo Gestor / Usuario"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-6 space-y-4 text-xs font-semibold text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-[#9F062A]">DNI *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 71218392"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-700">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 982109407"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-[#9F062A]">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Enrique"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-700">Apellidos</label>
                  <input
                    type="text"
                    placeholder="Ej. Mendoza Salas"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-[#9F062A]">Correo Institucional *</label>
                <input
                  type="email"
                  required
                  placeholder="Ej. carlos.mendoza@iestpsfa.edu.pe"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-[#9F062A]">Rol Institucional *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleSelectChange(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs font-bold cursor-pointer"
                  >
                    <option value="superadmin">Super Administrador (Sistema)</option>
                    <option value="administrador">Gestor MAMC (Admisión/Matrícula)</option>
                    <option value="mpa">Gestor MPA (Planificación Académica)</option>
                    <option value="mge">Gestor MGE (Gestión de Estudiantes)</option>
                    <option value="maf">Gestor MAF (Finanzas y Caja)</option>
                    <option value="docente">Docente</option>
                    <option value="alumno">Alumno</option>
                    <option value="postulante">Postulante</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-700">Contraseña *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-[#9F062A] text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9F062A] hover:bg-[#800421] text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
