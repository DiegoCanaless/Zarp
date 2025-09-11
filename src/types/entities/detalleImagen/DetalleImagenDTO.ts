import type { ImagenDTO } from "../imagen/ImagenDTO";

export interface DetalleImagenDTO {
  imgPrincipal: boolean;
  imagen: ImagenDTO; // Asegurate de tener esta interfaz
  propiedadId?: number;
}