import React, { useState } from "react";
import { loginWithEmailAndPassword } from "../../firebase/auth";

export default function GraduationAccessPanel({ error, onReload }: { error: string; onReload: () => Promise<boolean> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const credential = await loginWithEmailAndPassword(email.trim(), password);
      if (!credential) throw new Error("No disponible");
      setPassword("");
      if (!await onReload()) setMessage("La sesión se abrió, pero no fue posible consultar los expedientes. Reintente.");
    } catch { setMessage("No se pudo autenticar la cuenta. Verifique su correo y contraseña de Firebase."); }
    finally { setSaving(false); }
  };
  return <section className="max-w-xl rounded-xl border bg-white p-6 space-y-4">
    <h2 className="font-bold">Acceso a expedientes</h2><p role="alert" className="text-sm text-red-700">{error}</p>
    <p className="text-sm text-slate-600">La sesión local de MGE no sustituye la autenticación de Firebase. Ingrese con una cuenta institucional existente. Para registrar PDFs de certificados, la cuenta necesita un rol autorizado en sus claims de Firebase.</p>
    <form onSubmit={(event) => { void signIn(event); }} className="space-y-3"><fieldset disabled={saving} className="space-y-3">
      <label className="block text-sm">Correo institucional<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required className="block w-full border rounded-lg p-2 mt-1" /></label>
      <label className="block text-sm">Contraseña Firebase<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="block w-full border rounded-lg p-2 mt-1" /></label>
      <button type="submit" className="bg-[#9F062A] text-white rounded-lg px-4 py-2">{saving ? "Verificando..." : "Ingresar y cargar expedientes"}</button>
      <button type="button" onClick={() => { void onReload(); }} className="ml-3 border rounded-lg px-4 py-2">Reintentar con la sesión actual</button>
    </fieldset></form>{message ? <p role="alert" className="text-sm text-red-700">{message}</p> : null}
  </section>;
}
