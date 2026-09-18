import { useState, useEffect } from "react";
import { Enrollment } from "../../types";
import {
  fetchPayments,
  createPayment as apiCreatePayment,
  updatePayment as apiUpdatePayment,
  deletePayment as apiDeletePayment
} from "../../services/api";

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

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPayments()
      .then((apiPayments) => {
        if (apiPayments && apiPayments.length > 0) {
          const formatted = apiPayments.map((p) => ({
            ...p,
            id: p.paymentId || p.id || p._id
          }));
          setTransactions(formatted);
          localStorage.setItem("sfa_finance_transactions", JSON.stringify(formatted));
        }
      })
      .catch((err) => {
        console.error("Error fetching payments from REST API:", err);
        setError("Error al cargar comprobantes de tesorería.");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveTransactions = (nextList: any[]) => {
    setTransactions(nextList);
    try {
      localStorage.setItem("sfa_finance_transactions", JSON.stringify(nextList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_finance_transactions:", e);
    }
  };

  const handleRegisterPayment = async (studentDni: string, concept: string, amount: number, notes?: string) => {
    const newTxPayload = {
      paymentId: `tx-${Date.now()}`,
      studentDni,
      concept,
      amount,
      date: new Date().toISOString().split("T")[0],
      status: "APROBADO",
      notes
    };

    // 1. Enviar al backend NestJS REST API
    const apiResult = await apiCreatePayment(newTxPayload);
    const itemToSave = apiResult
      ? { ...apiResult, id: apiResult.paymentId || apiResult.id || apiResult._id }
      : newTxPayload;

    // 2. Actualizar estado local
    const nextTxList = [itemToSave, ...transactions];
    saveTransactions(nextTxList);

    // 3. Actualizar estado de pago en la matrícula del alumno si aplica
    if (onUpdateEnrollments && Array.isArray(enrollments)) {
      const updatedEnrollments = enrollments.map((e) =>
        e.studentDni === studentDni ? { ...e, paymentStatus: "Pagado" as const } : e
      );
      onUpdateEnrollments(updatedEnrollments);
    }
    return itemToSave;
  };

  const handleUpdatePaymentStatus = async (paymentId: string, status: string) => {
    await apiUpdatePayment(paymentId, { status });
    const nextTxList = transactions.map((t) => (t.id === paymentId || t.paymentId === paymentId ? { ...t, status } : t));
    saveTransactions(nextTxList);
  };

  const handleDeletePayment = async (paymentId: string) => {
    await apiDeletePayment(paymentId);
    const nextTxList = transactions.filter((t) => t.id !== paymentId && t.paymentId !== paymentId);
    saveTransactions(nextTxList);
  };

  const getTotalRevenue = () => {
    return transactions
      .filter((t) => t.status === "APROBADO")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  return {
    transactions,
    setTransactions,
    financeLoading: loading,
    financeError: error,
    handleRegisterPayment,
    handleUpdatePaymentStatus,
    handleDeletePayment,
    getTotalRevenue
  };
}
