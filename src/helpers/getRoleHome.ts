// src/utils/getRoleHome.ts
export function getRoleHome(role?: string, isAuth?: boolean) {
    if (!isAuth) return "/"; // visitante no logueado → Landing (o tu login)
    const R = String(role || "").toUpperCase();

    if (["SUPERADMIN", "EMPLEADO"].includes(R)) return "/WelcomeAdmin";
    if (["PROPIETARIO", "CLIENTE"].includes(R)) return "/Inicio";

    return "/"; // fallback
}
