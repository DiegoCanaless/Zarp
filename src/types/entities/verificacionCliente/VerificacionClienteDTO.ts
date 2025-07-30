import type { ImagenDTO } from "../imagen/ImagenDTO";

export interface VerificacionClienteDTO {
  fotoFrontal: ImagenDTO;
  fotoDocumentoFrontal: ImagenDTO;
  fotoDocumentoTrasero: ImagenDTO;
  clienteId: number;
}