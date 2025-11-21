// src/services/clientes.ts
import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

// Si usás Vite, podés definir VITE_API_BASE en .env, si no, fallback a localhost:
const API_BASE = `${import.meta.env.VITE_APIBASE}`;
const API_CLIENTES = `${API_BASE}/api/clientes`;

/** -------- Helpers internos -------- */

// --- getUsuarioByUidLogin (actualizado) ---
async function getUsuarioByUidLogin(uid: string): Promise<ClienteResponseDTO | null> {
    const res = await fetch(`${API_CLIENTES}/getByUidLogin/${encodeURIComponent(uid)}`);

    if (res.status === 404) return null;

    if (res.status === 403) {
        const err = new Error("Cuenta bloqueada");
        err.name = "CuentaBloqueadaError";
        throw err;
    }

    if (!res.ok) throw new Error("No se pudo obtener (cliente/empleado) por uid");
    return res.json();
}


async function existsUidLogin(uid: string): Promise<boolean> {
    const res = await fetch(`${API_CLIENTES}/existe-uidLogin/${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error("No se pudo verificar el UID (login)");
    return res.json();
}

/** -------- API pública -------- */

/**
 * Asegura el usuario (cliente o empleado) y devuelve SIEMPRE un ClienteResponseDTO con id/rol:
 * - Si NO existe ni como cliente ni como empleado -> crea CLIENTE (POST /api/clientes/save) y retorna.
 * - Si SÍ existe -> GET /api/clientes/getByUidLogin/{uid} y retorna ese registro (cliente o empleado).
 */
export async function ensureUsuarioConIdLogin(cliente: ClienteDTO): Promise<ClienteResponseDTO> {
    const existe = await existsUidLogin(cliente.uid);

    if (!existe) {
        // No existe ni como cliente ni como empleado -> crear como cliente
        const saveRes = await fetch(`${API_CLIENTES}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) throw new Error("Error al registrar nuevo cliente");
        return saveRes.json();
    }

    // Ya existe (cliente o empleado) -> traelo por /getByUidLogin
    const encontrado = await getUsuarioByUidLogin(cliente.uid);
    if (!encontrado) {
        throw new Error("El usuario existe pero no se pudo resolver por uid (login)");
    }
    return encontrado;
}

/** (Opcional) Si querés mantener la anterior para casos específicos de 'solo cliente' */
export async function ensureClienteConId(cliente: ClienteDTO): Promise<ClienteResponseDTO> {
    const checkRes = await fetch(`${API_CLIENTES}/existe-uid/${encodeURIComponent(cliente.uid)}`);
    if (!checkRes.ok) throw new Error("No se pudo verificar el UID");
    const existe: boolean = await checkRes.json();

    if (!existe) {
        const saveRes = await fetch(`${API_CLIENTES}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) throw new Error("Error al registrar nuevo cliente");
        return saveRes.json();
    }

    const res = await fetch(`${API_CLIENTES}/getByUid/${encodeURIComponent(cliente.uid)}`);
    if (res.status === 404) throw new Error("El cliente existe pero no se pudo obtener por uid");
    if (!res.ok) throw new Error("No se pudo obtener el cliente por uid");
    return res.json();
}