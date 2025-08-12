import type { ClienteDTO } from "../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../types/entities/cliente/ClienteResponseDTO";

export const putCliente = async (
    id: number,
    dto: ClienteDTO,
    token?: string
): Promise<ClienteResponseDTO> => {
    const res = await fetch(`http://localhost:8080/api/clientes/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(dto),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Error HTTP ${res.status}`);
    }
    return res.json();
};