import type { CaracteristicaResponseDTO } from "../caracteristica/CaracteristicaResponseDTO";

export interface DetalleCaracteristicaResponseDTO {
  id: number;
  caracteristica: CaracteristicaResponseDTO; // Asegurate de tener esta interfaz creada
}