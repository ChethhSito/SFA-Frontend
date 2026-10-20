import { AdmissionPeriod } from "../types";

export function todayInLima(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const get = (type: string) => parts.find(part => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function openAdmissionPeriod(periods: AdmissionPeriod[]): AdmissionPeriod | null {
  const today = todayInLima();
  return periods.find(period =>
    period.status === "APERTURADO" && period.isActive === true &&
    Boolean(period.academicPeriodId) &&
    period.preEnrollmentStartDate <= today && today <= period.preEnrollmentEndDate
  ) || null;
}
