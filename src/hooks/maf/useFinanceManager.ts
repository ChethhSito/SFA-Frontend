import { useState } from "react";
import { Enrollment } from "../../types";

export function useFinanceManager(
  enrollments: Enrollment[] = [],
  onUpdateEnrollments?: (updatedList: Enrollment[]) => void
) {
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_finance_transactions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading sfa_finance_transactions:", e);
      }
    }
    return [
      { id: "tx-1", studentDni: "12345678", concept: "Matrícula 2026-I", amount: 250, date: "2026-03-01", status: "APROBADO" },
      { id: "tx-2", studentDni: "87654321", concept: "Prospecto de Admisión", amount: 100, date: "2026-03-05", status: "APROBADO" }
    ];
  });

  const saveTransactions = (nextList: any[]) => {
    setTransactions(nextList);
    try {
      localStorage.setItem("sfa_finance_transactions", JSON.stringify(nextList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_finance_transactions:", e);
    }
  };

  const handleRegisterPayment = (studentDni: string, concept: string, amount: number) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      studentDni,
      concept,
      amount,
      date: new Date().toISOString().split("T")[0],
      status: "APROBADO"
    };
    const nextTxList = [newTx, ...transactions];
    saveTransactions(nextTxList);

    // Actualizar estado de pago en matrícula si aplica
    if (onUpdateEnrollments && Array.isArray(enrollments)) {
      const updatedEnrollments = enrollments.map((e) =>
        e.studentDni === studentDni ? { ...e, paymentStatus: "Pagado" as const } : e
      );
      onUpdateEnrollments(updatedEnrollments);
    }
    return newTx;
  };

  const getTotalRevenue = () => {
    return transactions
      .filter((t) => t.status === "APROBADO")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  return {
    transactions,
    setTransactions,
    handleRegisterPayment,
    getTotalRevenue
  };
}
