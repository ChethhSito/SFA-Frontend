import React, { useState } from "react";
import SuperAdminDashboard from "../admin/SuperAdminDashboard";
import { Role } from "../../types";

interface SuperAdminRouterProps {
  onLogout: () => void;
  onSwitchRole?: (role: Role, identifier: string) => void;
  onGoToPortal?: () => void;
}

export default function SuperAdminRouter({ onLogout, onSwitchRole,
  onGoToPortal
}: SuperAdminRouterProps) {
  return (
    <SuperAdminDashboard
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      onGoToPortal={onGoToPortal}
    />
  );
}
