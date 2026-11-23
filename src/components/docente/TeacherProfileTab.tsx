import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, UserCheck, Mail, Phone, MapPin, Award, 
  KeyRound, Bell, CheckCircle2, Save, Upload, School, Clock3, Lock,
  Trash2, Image as ImageIcon
} from 'lucide-react';
import { Teacher } from '../../types';
import { ToastNotice } from '../ui/Toast';
import PageTransition from '../ui/PageTransition';
import { getTeacherSignature } from '../../utils/teacherSignature';

interface TeacherProfileTabProps {
  teacher: Teacher | null;
  teacherDni: string;
  onShowNotice?: (notice: ToastNotice) => void;
}

export default function TeacherProfileTab({ teacher, teacherDni, onShowNotice }: TeacherProfileTabProps) {
  const currentDni = teacher?.dni || teacherDni || '99887766';
  const storageKey = `sfa_teacher_profile_${currentDni}`;

  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const fullName = teacher?.name || 'Manuel';
    const emailPrefix = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
      name: teacher?.name || 'Manuel',
      lastName: teacher?.lastName || 'Ramos Salazar',
      dni: currentDni,
      email: teacher?.email || `${emailPrefix}@iestpsfa.edu.pe`,
      personalEmail: (teacher as any)?.personalEmail || (teacher?.email ? teacher.email.replace('@iestpsfa.edu.pe', '@gmail.com') : ''),
      phone: (teacher as any)?.phone || (teacher as any)?.telefono || '+51 984 512 890',
      address: (teacher as any)?.address || 'Av. Universitaria 1420, Lima',
      specialty: teacher?.specialty || 'Control de Motores, PLC, Automatización Industrial',
      degree: (teacher as any)?.degree || 'Ingeniero Electricista — Reg. CIP 184592',
      pin: '1234',
      notifyTasks: true,
      notifyAbsences: true,
    };
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [customSignature, setCustomSignature] = useState<string | null>(() => {
    try {
      const fromKey = localStorage.getItem(`sfa_teacher_signature_${currentDni}`);
      if (fromKey) return fromKey;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.customSignatureUrl) return parsed.customSignatureUrl;
      }
    } catch {}
    return null;
  });

  const defaultSig = getTeacherSignature(`${form.name} ${form.lastName}`, currentDni);

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onShowNotice) {
        onShowNotice({
          id: Date.now(),
          type: 'warning',
          title: 'Formato Inválido',
          message: 'Por favor seleccione una imagen (PNG, JPG o SVG) de su firma manuscrita.'
        } as any);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomSignature(result);
      setForm(prev => ({ ...prev, customSignatureUrl: result }));
      try {
        localStorage.setItem(`sfa_teacher_signature_${currentDni}`, result);
        const stored = localStorage.getItem(storageKey);
        const obj = stored ? JSON.parse(stored) : {};
        localStorage.setItem(storageKey, JSON.stringify({ ...obj, customSignatureUrl: result }));
      } catch {}
      if (onShowNotice) {
        onShowNotice({
          id: Date.now(),
          type: 'success',
          title: 'Firma Digital Cargada',
          message: 'Su firma digital manuscrita ha sido cargada con éxito y vinculada a sus actas oficiales.'
        } as any);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomSignature = () => {
    setCustomSignature(null);
    setForm(prev => ({ ...prev, customSignatureUrl: null }));
    try {
      localStorage.removeItem(`sfa_teacher_signature_${currentDni}`);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const obj = JSON.parse(stored);
        delete obj.customSignatureUrl;
        localStorage.setItem(storageKey, JSON.stringify(obj));
      }
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onShowNotice) {
      onShowNotice({
        id: Date.now(),
        type: 'info',
        title: 'Firma Restablecida',
        message: 'Se ha restablecido la rúbrica caligráfica oficial por defecto.'
      } as any);
    }
  };

  const initials = `${(form.name || 'D').charAt(0)}${(form.lastName || 'T').charAt(0)}`.toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = { ...form, customSignatureUrl: customSignature };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      if (customSignature) {
        localStorage.setItem(`sfa_teacher_signature_${currentDni}`, customSignature);
      }
    } catch (err) {
      console.error('Error saving profile to localStorage:', err);
    }

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      if (onShowNotice) {
        onShowNotice({
          id: Date.now(),
          type: 'success',
          title: 'Expediente y Firma Actualizados',
          message: 'La información del docente, clave PIN y firma digital fueron sincronizadas correctamente.'
        } as any);
      }
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 400);
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
                  Habilitado
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Periodo Lectivo:</span>
                <span className="font-extrabold text-slate-900 font-mono">2027-I</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Firma Digital Certificada y Subida de Archivos */}
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
              Su firma digital y rúbrica se aplican en las actas semestrales y consolidación de notas oficiales ante MINEDU.
            </p>

            {/* Recuadro de Visualización y Sello Oficial */}
            <div className="border-2 border-blue-900/30 bg-blue-50/20 rounded-xl p-3.5 text-center space-y-2">
              <span className="text-[8px] font-black uppercase text-blue-950 block tracking-wider">
                IESTP SAN FRANCISCO DE ASÍS • FIRMA DOCENTE
              </span>

              <div className="h-16 bg-white border border-blue-900/20 rounded-lg flex items-center justify-center p-2 shadow-2xs">
                {customSignature ? (
                  <img 
                    src={customSignature} 
                    alt="Firma Manuscrita del Docente" 
                    className="max-h-12 max-w-full object-contain mx-auto"
                  />
                ) : (
                  <svg className="w-48 h-12 text-[#0f2b5c]" viewBox="0 0 180 70">
                    <path 
                      d={defaultSig.svgPath} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                )}
              </div>

              <div className="text-left space-y-0.5">
                <span className="text-[9.5px] font-black text-slate-900 uppercase block text-center leading-tight">
                  {form.name} {form.lastName}
                </span>
                <span className="text-[8px] text-slate-500 font-semibold block text-center">
                  {defaultSig.professionalTitle} | DNI: {currentDni}
                </span>
                <span className="text-[8px] font-mono text-emerald-700 font-bold block text-center">
                  {customSignature ? '✓ FIRMA MANUSCRITA PERSONALIZADA' : '✓ RÚBRICA CALIGRÁFICA OFICIAL'}
                </span>
              </div>
            </div>

            {/* Acciones para Subir o Cambiar Firma */}
            <div className="space-y-2">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleSignatureFileChange}
                className="hidden" 
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#800521] hover:bg-[#68041a] text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>{customSignature ? 'Reemplazar Mi Firma' : 'Subir Mi Firma (PNG / JPG)'}</span>
              </button>

              {customSignature && (
                <button
                  type="button"
                  onClick={handleRemoveCustomSignature}
                  className="w-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Restablecer Rúbrica Oficial por Defecto</span>
                </button>
              )}
            </div>

            {/* Configuración del PIN de Firma */}
            <div className="pt-2 border-t border-slate-150 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-500">
                PIN Oficial de Firma (4 dígitos)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={8}
                  value={form.pin || '1234'}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                  placeholder="1234"
                  className="w-28 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-black text-center text-sm outline-none focus:border-[#800521] text-slate-900 shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 font-semibold leading-tight">
                  Clave para firmar actas en Cierre de Curso y guardar calificaciones. (Por defecto: 1234)
                </span>
              </div>
            </div>

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
                <span className="font-bold text-emerald-600">Periodo Activo 2027 (Acreditado)</span>
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
