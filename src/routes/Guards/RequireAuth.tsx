// src/routes/guards/RequireAuth.tsx
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "../../reducer/user/userSlice";

type Props = { children: ReactNode; redirectTo?: string };

export default function RequireAuth({ children, redirectTo = "/" }: Props) {
    const isAuth = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuth) {
        // Guarda desde dónde intentó entrar para un posible redirect post-login
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return <>{children}</>;
}
