import { useState, useEffect } from "react";
import { SystemUser } from "../../types";
import {
  fetchUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser
} from "../../services/api";

export function useUsersManager() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchUsers()
      .then((apiUsers) => {
        if (apiUsers) {
          setUsers(apiUsers);
        }
      })
      .catch((err) => {
        console.error("Error fetching system users:", err);
        setError("Error al cargar usuarios del sistema.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateUser = async (newUser: Partial<SystemUser>) => {
    const created = await apiCreateUser(newUser);
    if (created) {
      setUsers((prev) => [...prev, created]);
    }
    return created;
  };

  const handleUpdateUser = async (id: string, data: Partial<SystemUser>) => {
    const updated = await apiUpdateUser(id, data);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    }
    return updated;
  };

  const handleDeleteUser = async (id: string) => {
    const success = await apiDeleteUser(id);
    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
    return success;
  };

  return {
    users,
    setUsers,
    usersLoading: loading,
    usersError: error,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
  };
}
