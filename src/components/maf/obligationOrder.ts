import { MafObligation } from './mafTypes';

function time(value?: string): number {
  const parsed = Date.parse(value || '');
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function newestObligations(items: MafObligation[]): MafObligation[] {
  return [...items].sort((a, b) => time(b.createdAt || b.dateCreated) - time(a.createdAt || a.dateCreated));
}

export function newestVouchers(items: MafObligation[]): MafObligation[] {
  return [...items].sort((a, b) =>
    time(b.voucherRegisteredAt || b.voucherDetails?.paymentDate || b.createdAt || b.dateCreated) -
    time(a.voucherRegisteredAt || a.voucherDetails?.paymentDate || a.createdAt || a.dateCreated)
  );
}
