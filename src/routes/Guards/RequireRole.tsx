// src/routes/guards/RequireRole.tsx
import { ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUserRol, selectIsAuthenticated } from "../../reducer/user/userSlice";

type Props = {
    children: ReactNode;
    allowed: string[];              // p.ej. ["SUPERADMIN","EMPLEADO"]
    redirectIfNotAuth?: string;     // p.ej. "/"
    redirectIfNotAllowed?: string;  // p.ej. "/un 
}

const roleHome: Record<string, string> = {
    SUPERADMIN: "/WelcomeAdmin",
    ADMIN: "/WelcomeAdmin",  // si lo usás
    PROPIETARIO: "/Inicio",
    CLIENTE: "/Inicio",
};

function normalize(role: unknown) {
    return String(role || "").toUpperCase();
}

export default function RequireRole({
    children,
    allowed,
    redirectIfNotAuth = "/",
}: Props) {
    const isAuth = useSelector(selectIsAuthenticated);
    const role = useSelector(selectUserRol);

    // Normalizá a mayúsculas para evitar mismatches
    const canPass = useMemo(() => {
        const r = normalize(role);
        return allowed.map(normalize).includes(r);
    }, [allowed, role]);

    if (!isAuth) return <Navigate to={redirectIfNotAuth} replace />;
    
    if (!canPass) {
        const target = roleHome[normalize(role)] || "/";
        return <Navigate to={target} replace />;
    }
    return <>{children}</>;
}
