import React, { useEffect, useState } from "react";
import { loginWithEmailAndPassword, onAuthStateChange } from "../../firebase/auth";
import { auth } from "../../firebase/config";
import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

export default function GraduationAccessPanel({ error, onReload, scope = "graduation" }: { error?: string; onReload: () => Promise<boolean>; scope?: "graduation" | "attendance" }) {
  const permittedRoles = scope === "attendance" ? ["mge", "docente", "administrador", "superadmin", "admin"] : ["mge", "administrador", "superadmin"];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [checking, setChecking] = useState(!!auth);
  const [changingAccount, setChangingAccount] = useState(false);
  useEffect(() => onAuthStateChange((user) => { setAccount(user?.email || null); setChecking(false); }), []);
  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const credential = await loginWithEmailAndPassword(email.trim(), password);
      if (!credential) throw new Error("No disponible");
      setPassword("");
      setChangingAccount(false);
      const token = await credential.user.getIdTokenResult(true);
      const permitted = permittedRoles.includes(String(token.claims.role));
      const loaded = await onReload();
      setMessage(!permitted ? "Su cuenta necesita un permiso institucional autorizado para este módulo. Solicítelo al administrador." : !loaded ? "No fue posible cargar los registros. Reintente actualizar el acceso." : "");
    } catch { setMessage("No se pudo autenticar la cuenta. Verifique su correo y contraseña de Firebase."); }
    finally { setSaving(false); }
  };
  const refresh = async () => {
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      if (!auth?.currentUser) { setMessage("Ingrese su correo y contraseña para conectar su cuenta."); return; }
      const token = await auth.currentUser.getIdTokenResult(true);
      const loaded = await onReload();
      setMessage(!permittedRoles.includes(String(token.claims.role)) ? "Su cuenta todavía no tiene el permiso institucional requerido. Solicítelo al administrador y luego actualice el acceso." : loaded ? "Acceso actualizado." : "No se pudieron cargar los registros. Verifique la conexión con el servidor.");
    } catch { setMessage("No se pudo actualizar el acceso. Vuelva a ingresar con su cuenta."); }
    finally { setSaving(false); }
  };
  if (checking) return <div role="status" className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Comprobando sesión...</div>;
  if (account && !changingAccount) return <section aria-label="Cuenta conectada" className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /><div className="min-w-0"><p className="text-sm font-semibold text-emerald-900">Sesión conectada</p><p className="break-all text-xs text-emerald-800">{account}</p></div></div>
      <div className="flex flex-wrap gap-3 text-xs"><button type="button" disabled={saving} onClick={() => { void refresh(); }} className="font-semibold text-emerald-800 hover:underline disabled:opacity-50">{saving ? "Actualizando..." : "Actualizar acceso"}</button><button type="button" disabled={saving} onClick={() => { setChangingAccount(true); setMessage(""); }} className="font-semibold text-slate-600 hover:underline">Cambiar cuenta</button></div>
    </div>
    {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
    {message ? <p role="status" className="mt-3 text-sm text-slate-700">{message}</p> : null}
  </section>;
  return <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{scope === "attendance" ? "Acceso al registro de asistencia" : "Acceso a expedientes"}</h2><span className={`rounded-full px-3 py-1 text-xs font-medium ${account ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{account ? `Cuenta: ${account}` : "Cuenta sin conectar"}</span></div>
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    <p className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0" />{scope === "attendance" ? "Conecte su cuenta institucional. El servidor verificará su rol y las secciones asignadas a su identidad." : "Ingrese con su cuenta autorizada para acceder a los documentos."}</p>
    <form onSubmit={(event) => { void signIn(event); }}><fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] items-end">
      <label className="block text-sm font-medium">Correo electrónico<input type="email" autoComplete="username" placeholder="correo@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="block w-full border border-slate-300 rounded-lg p-2.5 mt-1.5" /></label>
      <label className="block text-sm font-medium">Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="block w-full border border-slate-300 rounded-lg p-2.5 mt-1.5" /></label>
      <div className="flex gap-3 items-center"><button type="submit" className="bg-[#9F062A] text-white rounded-lg px-4 py-2.5 font-semibold text-sm">{saving ? "Verificando..." : "Conectar cuenta"}</button>{account ? <button type="button" onClick={() => { setChangingAccount(false); setPassword(""); }} className="text-sm text-slate-600">Cancelar</button> : null}</div>
    </fieldset></form>{message ? <p role="status" className="text-sm text-slate-700">{message}</p> : null}
  </section>;
}
