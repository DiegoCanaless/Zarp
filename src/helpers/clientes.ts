// services/clientes.ts
import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

const API = "http://localhost:8080/api/clientes";

export async function ensureClienteStrict(cliente: ClienteDTO): Promise<ClienteResponseDTO> {
    // 1) existe?
    const existsRes = await fetch(`${API}/existe-uid/${encodeURIComponent(cliente.uid)}`);
    if (!existsRes.ok) throw new Error("No se pudo verificar existencia del cliente");
    const exists: boolean = await existsRes.json();

    if (!exists) {
        // 2) crear y LEER el body (trae id)
        const saveRes = await fetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        if (!saveRes.ok) throw new Error("Error al registrar nuevo cliente");
        const creado: ClienteResponseDTO = await saveRes.json();
        return creado; // ✅ trae id
    }

    // 3) existe pero NO hay endpoint para traerlo por uid → no puedo obtener id
    throw new Error(
        "El cliente ya existe pero tu API no expone GET por UID. " +
        "Agrega un endpoint (p.ej. GET /api/clientes/por-uid/{uid}) para poder obtener el id."
    );
}
