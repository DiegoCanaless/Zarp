import type { ImagenResponseDTO } from "../imagen/ImagenResponseDTO";

export interface DetalleImagenResponseDTO {
  id: number;
  imgPrincipal: boolean;
  imagen: ImagenResponseDTO; // Asegurate de tener esta interfaz también
}