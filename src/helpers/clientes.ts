
import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

const API = `${import.meta.env.VITE_APIBASE}/api/clientes`;


async function getByUid(uid: string): Promise<ClienteResponseDTO> {
    const res = await fetch(`${API}/getByUid/${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error("No se pudo obtener el cliente por uid");
    return res.json();
}

/**
 * Registro estricto para CLIENTE:
 * - Si no existe → crea y devuelve el creado (con rol, idealmente “CLIENTE” por default en el backend).
 * - Si existe → lo trae por UID y lo devuelve (para tener rol/id/flags correctos).
 */
export async function ensureClienteStrict(cliente: ClienteDTO): Promise<ClienteResponseDTO> {
    const existsRes = await fetch(`${API}/existe-uid/${encodeURIComponent(cliente.uid)}`);
    if (!existsRes.ok) throw new Error("No se pudo verificar existencia del cliente");
    const exists: boolean = await existsRes.json();

    if (!exists) {
        const saveRes = await fetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) throw new Error("Error al registrar nuevo cliente");
        const creado: ClienteResponseDTO = await saveRes.json();
        return creado;


    }

    // 👉 Si ya existe, lo traemos para conocer rol/id/etc.
    return getByUid(cliente.uid);

}