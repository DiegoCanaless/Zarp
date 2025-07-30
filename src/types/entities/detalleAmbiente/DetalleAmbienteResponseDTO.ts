import type { AmbienteDTO } from "../ambiente/AmbienteDTO";

export interface DetalleAmbienteResponseDTO {
  id: number;
  cantidad: number;
  ambiente: AmbienteDTO; // Asegurate de tener definida esta interfaz también
}