import { AttendanceRecord } from "../types";
import { auth } from "../firebase/config";
const BASE = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:3001";
export interface ScheduledClass {
  id: string; courseId: string; courseName: string; courseCode: string; careerId: string; careerName: string;
  groupId: string; groupName: string; periodId: string; periodName: string; periodStatus: string; periodActive: boolean; teacherDni: string;
  startDate: string | null; endDate: string | null; shift: string; dayOfWeek: string;
  startTime: string | null; endTime: string | null; sessionType: string; teacherName: string; classroomName: string;
  rosterCount: number; issues: string[];
}
export interface AttendanceSession extends AttendanceRecord {
  _id: string; programmingId: string; groupId: string; periodId: string; courseName: string; courseCode: string;
  groupName: string; startTime: string; endTime: string; sessionType: string; teacherName: string; classroomName: string;
  extraordinary: boolean; reason?: string; revision?: number; registeredAt?: string; roster: { dni: string; name: string; lastName: string }[];
}
async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  let response: Response;
  await auth?.authStateReady();
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Conecte su cuenta institucional para consultar y registrar asistencias.");
  try { response = await fetch(`${BASE}/attendance-sessions${path}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, ...(body ? { body: JSON.stringify(body) } : {}) }); }
  catch { throw new Error("No se pudo conectar con el servidor de asistencias. Reintente la consulta."); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message || "No se pudo completar la consulta de sesiones.");
  return data as T;
}
export const fetchAttendanceProgramming = () => request<ScheduledClass[]>("/programming");
export const fetchAttendanceSessions = () => request<AttendanceSession[]>("");
export const createAttendanceSession = (body: { programmingId: string; date: string; extraordinary: boolean; reason: string }) => request<AttendanceSession>("", "POST", body);
export const markAttendanceSession = (id: string, statusMap: Record<string, string>, revision = 0) => request<AttendanceSession>(`/${encodeURIComponent(id)}/marks`, "PATCH", { statusMap, revision });
