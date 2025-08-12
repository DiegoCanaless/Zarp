// src/services/clientes.ts
import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

const API = "http://localhost:8080/api/clientes";

/**
 * Asegura el cliente y devuelve SIEMPRE el ClienteResponseDTO con id:
 * - Si NO existe -> POST /save y retorna el body (con id).
 * - Si SÍ existe -> GET /api/clientes, filtra por uid y retorna ese registro.
 */
export async function ensureClienteConId(cliente: ClienteDTO): Promise<ClienteResponseDTO> {
    // 1) Verificar existencia por UID (boolean)
    const checkRes = await fetch(`${API}/existe-uid/${encodeURIComponent(cliente.uid)}`);
    if (!checkRes.ok) throw new Error("No se pudo verificar el UID");
    const existe: boolean = await checkRes.json();

    if (!existe) {
        // 2) Crear y devolver el creado (incluye id)
        const saveRes = await fetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) throw new Error("Error al registrar nuevo cliente");
        const creado: ClienteResponseDTO = await saveRes.json();
        return creado;
    }

    // 3) Ya existe -> traer todos y filtrar por uid
    const listRes = await fetch(`${API}`);
    if (!listRes.ok) throw new Error("No se pudo obtener la lista de clientes");
    const lista: ClienteResponseDTO[] = await listRes.json();

    const encontrado = lista.find(c => c.uid === cliente.uid);
    if (!encontrado) {
        // edge case raro: existeByUid=true pero no aparece en findAll
        throw new Error("El cliente existe pero no se pudo resolver su id desde la lista");
    }
    return encontrado;
}
