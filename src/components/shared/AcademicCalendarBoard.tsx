import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, ImagePlus, Megaphone, Trash2 } from 'lucide-react';
import { MpaPeriod } from '../../types';
import { fetchMpaCollection } from '../../services/mpaApi';
import {
  AcademicCalendarData, AcademicCalendarEvent, CalendarEventType, academicCalendarImageUrl,
  deleteAcademicCalendarImage, fetchAcademicCalendar, saveAcademicCalendarEvents, uploadAcademicCalendarImage,
} from '../../services/academicCalendar';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}

const eventColors: Record<CalendarEventType, string> = {
  Feriado: 'bg-rose-50 text-rose-800 border-rose-200',
  Actividad: 'bg-blue-50 text-blue-800 border-blue-200',
  Aviso: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default function AcademicCalendarBoard({ editable = false, periods, preferredPeriodId }: {
  editable?: boolean;
  periods?: MpaPeriod[];
  preferredPeriodId?: string;
}) {
  const [loadedPeriods, setLoadedPeriods] = useState<MpaPeriod[]>([]);
  const availablePeriods = periods || loadedPeriods;
  const [periodId, setPeriodId] = useState('');
  const [calendar, setCalendar] = useState<AcademicCalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState({ date: '', type: 'Actividad' as CalendarEventType, title: '', description: '' });

  useEffect(() => {
    if (periods) return;
    let active = true;
    fetchMpaCollection<MpaPeriod>('periods').then((items) => { if (active) setLoadedPeriods(items); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los períodos.'); });
    return () => { active = false; };
  }, [periods]);

  useEffect(() => {
    if (!availablePeriods.length) { setPeriodId(''); return; }
    if (periodId && availablePeriods.some((period) => period.id === periodId)) return;
    const preferred = availablePeriods.find((period) => period.id === preferredPeriodId);
    const active = availablePeriods.find((period) => period.isActive);
    const latest = [...availablePeriods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    setPeriodId((preferred || active || latest).id);
  }, [availablePeriods, periodId, preferredPeriodId]);

  useEffect(() => {
    if (!periodId) { setCalendar(null); return; }
    let active = true;
    setLoading(true);
    setError('');
    fetchAcademicCalendar(periodId).then((data) => { if (active) setCalendar(data); })
      .catch((cause) => { if (active) { setCalendar(null); setError(cause instanceof Error ? cause.message : 'No se pudo cargar el calendario.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [periodId]);

  const period = useMemo(() => availablePeriods.find((item) => item.id === periodId), [availablePeriods, periodId]);
  const events = calendar?.events || [];
  const run = async (action: () => Promise<AcademicCalendarData>, success: string): Promise<boolean> => {
    setBusy(true);
    setError('');
    setMessage('');
    try { setCalendar(await action()); setMessage(success); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el calendario.'); return false; }
    finally { setBusy(false); }
  };

  const publishEvent = async (event: FormEvent) => {
    event.preventDefault();
    if (!period || !draft.date || !draft.title.trim()) return;
    const next: AcademicCalendarEvent = {
      id: crypto.randomUUID(), date: draft.date, type: draft.type,
      title: draft.title.trim(), description: draft.description.trim(),
    };
    if (await run(() => saveAcademicCalendarEvents(period.id, [...events, next]), 'Anuncio publicado para ambos portales.')) {
      setDraft({ date: '', type: 'Actividad', title: '', description: '' });
    }
  };

  const uploadImage = (file?: File) => {
    if (!period || !file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Seleccione una imagen PNG, JPEG o WebP de hasta 5 MB.');
      return;
    }
    void run(() => uploadAcademicCalendarImage(period.id, file), 'Imagen del calendario publicada.');
  };

  return <section className="space-y-6 text-left">
    <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm">
      <div className="flex items-center gap-3"><CalendarDays className="h-7 w-7 text-amber-300" /><div>
        <h1 className="text-xl font-black">Calendario académico</h1>
        <p className="mt-1 text-sm text-rose-50">{editable ? 'Publicación institucional para alumnos y docentes' : 'Fechas y actividades comunicadas por la institución'}</p>
      </div></div>
    </header>

    {availablePeriods.length ? <label className="block max-w-sm text-sm font-bold text-slate-700">Período académico
      <select value={periodId} onChange={(event) => setPeriodId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5">
        {availablePeriods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label> : <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">No hay períodos académicos registrados.</p>}

    {period && <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Inicio del período</p><p className="mt-1 font-black text-slate-900">{formatDate(period.startDate)}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Fin del período</p><p className="mt-1 font-black text-slate-900">{formatDate(period.endDate)}</p></div>
    </div>}

    {loading && <p role="status" className="text-sm text-slate-600">Cargando calendario...</p>}
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

    {period && calendar && <>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-black text-slate-900"><ImagePlus className="h-5 w-5 text-[#800521]" /> Imagen del calendario</h2>
          {editable && <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <label className="cursor-pointer rounded-lg bg-[#800521] px-3 py-2 text-white">{busy ? 'Guardando...' : 'Subir imagen'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="sr-only" onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = ''; }} /></label>
            {calendar.hasImage && <button type="button" disabled={busy} onClick={() => void run(() => deleteAcademicCalendarImage(period.id), 'Imagen retirada.')} className="rounded-lg border border-rose-200 px-3 py-2 text-rose-700 disabled:opacity-50">Quitar imagen</button>}
          </div>}
        </div>
        {calendar.hasImage ? <div className="mt-4 space-y-2">
          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
            <img src={academicCalendarImageUrl(period.id, calendar.imageUpdatedAt)} alt={`Calendario académico de ${period.name}`} className="block h-auto max-h-[760px] w-full object-contain" />
          </div>
          <a href={academicCalendarImageUrl(period.id, calendar.imageUpdatedAt)} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-bold text-[#800521] underline">Ver imagen en tamaño completo · {calendar.imageFileName}</a>
        </div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">La institución aún no ha publicado una imagen para este período.</p>}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black text-slate-900"><Megaphone className="h-5 w-5 text-[#800521]" /> Feriados, actividades y avisos</h2>
        <p className="mt-1 text-sm text-slate-600">Publicaciones con fecha dentro de {period.name}.</p>
        {events.length ? <div className="mt-4 space-y-3">{events.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
          <div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><time dateTime={item.date} className="text-sm font-black text-slate-900">{formatDate(item.date)}</time><span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${eventColors[item.type]}`}>{item.type}</span></div>
            <h3 className="font-bold text-slate-800">{item.title}</h3>{item.description && <p className="whitespace-pre-wrap text-sm text-slate-600">{item.description}</p>}</div>
          {editable && <button type="button" disabled={busy} aria-label={`Eliminar ${item.title}`} onClick={() => void run(() => saveAcademicCalendarEvents(period.id, events.filter((current) => current.id !== item.id)), 'Anuncio eliminado.')} className="rounded-lg border border-rose-200 p-2 text-rose-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
        </article>)}</div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">Todavía no se han publicado feriados ni actividades para este período.</p>}
      </div>

      {editable && <form onSubmit={(event) => void publishEvent(event)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black text-slate-900">Publicar fecha o aviso</h2>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Fecha
          <input type="date" required min={period.startDate} max={period.endDate} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5" />
        </label><label className="text-sm font-bold text-slate-700">Tipo
          <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CalendarEventType })} className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5"><option>Actividad</option><option>Feriado</option><option>Aviso</option></select>
        </label></div>
        <label className="block text-sm font-bold text-slate-700">Título
          <input required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5" />
        </label>
        <label className="block text-sm font-bold text-slate-700">Descripción (opcional)
          <textarea maxLength={600} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5" />
        </label>
        <button type="submit" disabled={busy} className="rounded-lg bg-[#800521] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">Publicar en ambos portales</button>
      </form>}
    </>}
  </section>;
}
