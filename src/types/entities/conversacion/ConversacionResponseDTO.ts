import type { MensajeResponseDTO } from "../mensaje/MensajeResponseDTO";
import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";

export interface ConversacionResponseDTO {
  id: number;
  activo: boolean;
  fechaCreacion: string; // formato ISO (YYYY-MM-DD)
  cliente1: ClienteResponseDTO;
  cliente2: ClienteResponseDTO;
  mensajes: MensajeResponseDTO[];
}
