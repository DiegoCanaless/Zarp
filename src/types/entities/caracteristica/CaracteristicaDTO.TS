import type { ImagenDTO } from "../imagen/ImagenDTO";

export interface CaracteristicaDTO {
  denominacion: string;
  descripcion: string;
  imagen: ImagenDTO;
}