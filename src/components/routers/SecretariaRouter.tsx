import { useEffect, useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import SecretariaDashboard from '../secretaria/SecretariaDashboard';

export default function SecretariaRouter({ onLogout, onGoToPortal }: { onLogout: () => void; onGoToPortal: () => void }) {
  const [session, setSession] = useState<string | null>(null);
  useEffect(() => setSession(localStorage.getItem('sfa_session_secretaria')), []);
  if (!session) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
    <div className="max-w-sm bg-slate-900 rounded-xl p-8 text-center space-y-4">
      <Lock className="mx-auto text-amber-400" size={34} />
      <h1 className="font-bold text-lg">Sesión de Secretaría requerida</h1>
      <p className="text-sm text-slate-300">Ingrese con una cuenta autorizada para emitir documentos.</p>
      <button onClick={onLogout} className="bg-[#9F062A] rounded px-4 py-2 text-sm font-bold inline-flex items-center gap-2"><ArrowLeft size={16}/> Volver al portal</button>
    </div>
  </div>;
  return <SecretariaDashboard onLogout={onLogout} onGoToPortal={onGoToPortal} />;
}
