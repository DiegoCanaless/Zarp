import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";


export interface MensajeResponseDTO {
  id: number;
  contenido: string;
  emisor: ClienteResponseDTO;
  fechaEnvio: string; // ISO date string, o Date si preferís
  horaEnvio: string;  // Formato "HH:mm:ss" o similar
}