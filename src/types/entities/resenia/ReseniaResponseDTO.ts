import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";

export interface ReseniaResponseDTO {
  id: number;
  usuario: ClienteResponseDTO;
  comentario: string;
  calificacion: number;
}