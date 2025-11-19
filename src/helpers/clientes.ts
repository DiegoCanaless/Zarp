import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

const API_BASE = `${import.meta.env.VITE_APIBASE}`;
const API_CLIENTES = `${API_BASE}/api/clientes`;

function buildHeaders(token?: string, extra: Record<string, string> = {}) {
    const headers: Record<string, string> = { ...extra };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

async function getUsuarioByUidLogin(uid: string, token?: string): Promise<ClienteResponseDTO | null> {
    const res = await fetch(`${API_CLIENTES}/getByUidLogin/${encodeURIComponent(uid)}`, {
        headers: buildHeaders(token)
    });
    if (res.status === 404) return null;
    if (res.status === 403) {
        const err = new Error("Cuenta bloqueada");
        err.name = "CuentaBloqueadaError";
        throw err;
    }
    if (!res.ok) throw new Error("No se pudo obtener (cliente/empleado) por uid");
    return res.json();
}

async function existsUidLogin(uid: string, token?: string): Promise<boolean> {
    const res = await fetch(`${API_CLIENTES}/existe-uidLogin/${encodeURIComponent(uid)}`, {
        headers: buildHeaders(token)
    });
    if (!res.ok) throw new Error("No se pudo verificar el UID (login)");
    return res.json();
}

export async function ensureUsuarioConIdLogin(cliente: ClienteDTO, token?: string): Promise<ClienteResponseDTO> {
    const existe = await existsUidLogin(cliente.uid, token);

    if (!existe) {
        const saveRes = await fetch(`${API_CLIENTES}/save`, {
            method: "POST",
            headers: buildHeaders(token, { "Content-Type": "application/json" }),
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) {
            const text = await saveRes.text().catch(() => "");
            throw new Error(`Error al registrar nuevo cliente: ${saveRes.status} ${text}`);
        }
        return saveRes.json();
    }

    const encontrado = await getUsuarioByUidLogin(cliente.uid, token);
    if (!encontrado) throw new Error("El usuario existe pero no se pudo resolver por uid (login)");
    return encontrado;
}

export async function ensureClienteConId(cliente: ClienteDTO, token?: string): Promise<ClienteResponseDTO> {
    const checkRes = await fetch(`${API_CLIENTES}/existe-uid/${encodeURIComponent(cliente.uid)}`, {
        headers: buildHeaders(token)
    });
    if (!checkRes.ok) throw new Error("No se pudo verificar el UID");
    const existe: boolean = await checkRes.json();

    if (!existe) {
        const saveRes = await fetch(`${API_CLIENTES}/save`, {
            method: "POST",
            headers: buildHeaders(token, { "Content-Type": "application/json" }),
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) {
            const text = await saveRes.text().catch(() => "");
            throw new Error(`Error al registrar nuevo cliente: ${saveRes.status} ${text}`);
        }
        return saveRes.json();
    }

    const res = await fetch(`${API_CLIENTES}/getByUid/${encodeURIComponent(cliente.uid)}`, {
        headers: buildHeaders(token)
    });
    if (res.status === 404) throw new Error("El cliente existe pero no se pudo obtener por uid");
    if (!res.ok) throw new Error("No se pudo obtener el cliente por uid");
    return res.json();
}

export async function ensureClienteStrict(cliente: ClienteDTO, token?: string): Promise<ClienteResponseDTO> {
    return ensureClienteConId(cliente, token);
}