import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserRole, OperatorType, OperatorUser, normalizeOperatorType } from "../../types/auth";
import { EventFlowLogo } from "../home/EventFlowLogo";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedOperatorTypes?: OperatorType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  allowedOperatorTypes,
}) => {
  const { user, isAuthenticated, isLoading, getRoleDefaultPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F8FF] flex flex-col items-center justify-center text-[#0B1120]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <EventFlowLogo size={48} />
          <div className="flex items-center gap-2 text-sm font-medium text-[#6B6252]">
            <span className="w-2 h-2 rounded-full bg-[#4F7CFF] animate-ping" />
            <span>Verifying session security...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/signin?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but visiting a route for a different role, redirect to their home
    return <Navigate to={getRoleDefaultPath(user.role)} replace />;
  }

  // Operator-type specific route isolation enforcement
  if (user.role === "operator" && allowedOperatorTypes && allowedOperatorTypes.length > 0) {
    const operatorUser = user as OperatorUser;
    const currentOpType = normalizeOperatorType(operatorUser.operatorType);

    if (!allowedOperatorTypes.includes(currentOpType)) {
      // Redirect to /operators with unauthorized notice
      return (
        <Navigate
          to={`/operators?access_denied=1&required=${encodeURIComponent(
            allowedOperatorTypes.join(",")
          )}&current=${encodeURIComponent(currentOpType)}`}
          replace
        />
      );
    }
  }

  return <>{children}</>;
};
