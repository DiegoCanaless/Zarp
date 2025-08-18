// src/services/clientes.ts
import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

const API = "http://localhost:8080/api/clientes";

async function getClientePorUid(uid: string): Promise<ClienteResponseDTO | null> {
    const res = await fetch(`${API}/getByUid/${encodeURIComponent(uid)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("No se pudo obtener el cliente por uid");
    return res.json();
}

/**
 * Asegura el cliente y devuelve SIEMPRE el ClienteResponseDTO con id:
 * - Si NO existe -> POST /save y retorna el body (con id).
 * - Si SÍ existe -> GET /getByUid/{uid} y retorna ese registro.
 */
export async function ensureClienteConId(cliente: ClienteDTO): Promise<ClienteResponseDTO> {
    // 1) ¿Existe?
    const checkRes = await fetch(`${API}/existe-uid/${encodeURIComponent(cliente.uid)}`);
    if (!checkRes.ok) throw new Error("No se pudo verificar el UID");
    const existe: boolean = await checkRes.json();

    if (!existe) {
        // 2) Crear y devolver
        const saveRes = await fetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) throw new Error("Error al registrar nuevo cliente");
        return saveRes.json();
    }

    // 3) Ya existe -> traer solo ese uid
    const encontrado = await getClientePorUid(cliente.uid);
    if (!encontrado) {
        // Edge case: existe=true pero no se encuentra (condición de carrera, etc.)
        throw new Error("El cliente existe pero no se pudo resolver por uid");
    }
    return encontrado;
}
