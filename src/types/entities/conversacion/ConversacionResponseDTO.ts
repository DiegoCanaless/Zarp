import type { MensajeResponseDTO } from "../mensaje/MensajeResponseDTO";

export interface ConversacionResponseDTO {
  id: number;
  activo: boolean;
  mensajes: MensajeResponseDTO[];
  fechaCreacion: string; // ISO string, si usás Date podés poner: Date
}