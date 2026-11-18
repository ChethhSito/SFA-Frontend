import React, { useState } from 'react';
import { 
  ShieldCheck, UserCheck, Mail, Phone, MapPin, Award, 
  KeyRound, Bell, CheckCircle2, Save, Upload, School, Clock3, Lock
} from 'lucide-react';
import { Teacher } from '../../types';
import { ToastNotice } from '../ui/Toast';
import PageTransition from '../ui/PageTransition';

interface TeacherProfileTabProps {
  teacher: Teacher | null;
  teacherDni: string;
  onShowNotice?: (notice: ToastNotice) => void;
}

export default function TeacherProfileTab({ teacher, teacherDni, onShowNotice }: TeacherProfileTabProps) {
  const [form, setForm] = useState({
    name: teacher?.name || 'Manuel',
    lastName: teacher?.lastName || 'Ramos Salazar',
    dni: teacher?.dni || teacherDni,
    email: teacher?.email || 'mramos@iestpsfa.edu.pe',
    personalEmail: 'm.ramos.salazar@gmail.com',
    phone: '+51 987 654 321',
    address: 'Av. Universitaria 1420, Lima',
    specialty: teacher?.specialty || 'Control de Motores, PLC, Automatización Industrial',
    degree: 'Ingeniero Electricista — Reg. CIP 184592',
    pin: '1234',
    notifyTasks: true,
    notifyAbsences: true,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const initials = `${form.name.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      if (onShowNotice) {
        onShowNotice({
          type: 'success',
          title: 'Expediente Actualizado',
          message: 'La información del docente titular y sus credenciales de firma fueron sincronizadas correctamente.'
        });
      }
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 600);
  };

  return (
    <PageTransition id="teacher-profile-tab" className="space-y-6 text-left font-sans">
      {/* 1. Hero Banner Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL DOCENTE • EXPEDIENTE Y EXPEDICIÓN DIGITAL
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Configuración y Expediente Docente
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Gestione sus datos de contacto oficial, credenciales de pasarela académica y certificación de firma digital homologada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">DNI Oficial</span>
              <span className="text-xs font-black text-white font-mono">{form.dni}</span>
            </div>
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Condición</span>
              <span className="text-xs font-black text-emerald-400 font-mono">Docente Titular</span>
            </div>
          </div>
        </div>

        {/* Cinta de Parámetros Académicos Reales */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <Clock3 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Régimen Docente</span>
              <span className="font-extrabold text-white">Tiempo Completo (40 Hrs)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <School className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Área Curricular</span>
              <span className="font-extrabold text-white">Electricidad Industrial</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Firma Digital</span>
              <span className="font-extrabold text-white">Homologada RENIEC / SFA</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Sede Central</span>
              <span className="font-extrabold text-white">Campus Principal • Pabellón A</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid de Información y Credenciales (2 columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Tarjeta de Identidad y Firma Digital */}
        <div className="space-y-6">
          {/* Tarjeta de Avatar y Cargo */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#800521] to-amber-500 text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-white">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Docente Habilitado">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase">
                {form.name} {form.lastName}
              </h2>
              <p className="text-xs font-bold text-[#800521] mt-0.5">
                {form.degree}
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase">
                ID: SFA-DOC-{form.dni}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-150 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Estado de Cuenta:</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] uppercase">
                  ✓ Habilitado
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Periodo Lectivo:</span>
                <span className="font-extrabold text-slate-900 font-mono">2027-I</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Firma Digital Certificada */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4 border-t-4 border-t-[#800521]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900">Firma Digital Homologada</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Certificado Activo (X.509 v3)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Su firma digital vinculada a su DNI se encuentra acreditada conforme a la directiva institucional y MINEDU para la suscripción de actas oficiales.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[10.5px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Algoritmo:</span>
                <span className="font-bold text-slate-800">SHA-256 with RSA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emisor:</span>
                <span className="font-bold text-slate-800">MINEDU - IESTP SFA CA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vigencia:</span>
                <span className="font-bold text-emerald-600">2026 - 2028 (Conforme)</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-400">PIN de Firma:</span>
                <span className="font-bold text-[#800521]">•••• (PIN: 1234)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Configuración y Datos */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Tarjeta 1: Datos Personales */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-5">
              <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900">Información del Docente Titular</h3>
                  <p className="text-xs text-slate-500">Datos registrados en el legajo docente institucional.</p>
                </div>
                <UserCheck className="w-5 h-5 text-[#800521]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Nombres</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">DNI Oficial</label>
                  <input
                    type="text"
                    disabled
                    value={form.dni}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 cursor-not-allowed"
                  />
                  <span className="text-[9.5px] text-slate-400 mt-1 block">Validado ante RENIEC</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">E-mail Institucional</label>
                  <input
                    type="email"
                    disabled
                    value={form.email}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-not-allowed"
                  />
                  <span className="text-[9.5px] text-slate-400 mt-1 block">Buzón corporativo oficial</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">E-mail Personal de Recuperación</label>
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) => setForm({ ...form, personalEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Especialidad Principal y Cátedra</label>
                  <input
                    type="text"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Grado Académico / Título Profesional</label>
                  <input
                    type="text"
                    value={form.degree}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Notificaciones y Seguridad */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
              <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900">Seguridad y Notificaciones</h3>
                  <p className="text-xs text-slate-500">Alertas de aula y clave para actas oficiales.</p>
                </div>
                <Lock className="w-5 h-5 text-[#800521]" />
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.notifyTasks}
                    onChange={(e) => setForm({ ...form, notifyTasks: e.target.checked })}
                    className="w-4 h-4 text-[#800521] rounded"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block">Notificar entregas de tareas</span>
                    <span className="text-[11px] text-slate-500 font-medium">Recibir avisos cuando un estudiante entregue un trabajo o informe.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.notifyAbsences}
                    onChange={(e) => setForm({ ...form, notifyAbsences: e.target.checked })}
                    className="w-4 h-4 text-[#800521] rounded"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block">Alerta temprana de inasistencias</span>
                    <span className="text-[11px] text-slate-500 font-medium">Avisar cuando un estudiante acumule 3 inasistencias consecutivas.</span>
                  </div>
                </label>
              </div>

              {/* Botón de Guardado */}
              <div className="pt-3 flex items-center justify-between">
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ¡Cambios guardados con éxito!
                  </span>
                )}
                {!savedSuccess && <div />}

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{saving ? 'Guardando...' : 'Guardar Información de Perfil'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </PageTransition>
  );
}
