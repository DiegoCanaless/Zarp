import type { ImagenResponseDTO } from "../imagen/ImagenResponseDTO";

export interface CaracteristicaResponseDTO {
  id: number;
  activo: boolean;
  denominacion: string;
  descripcion: string;
  imagen: ImagenResponseDTO;
}