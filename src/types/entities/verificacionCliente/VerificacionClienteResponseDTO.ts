import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";
import type { ImagenResponseDTO } from "../imagen/ImagenResponseDTO";

export interface VerificacionClienteResponseDTO {
  id: number;
  activo: boolean;
  fotoFrontal: ImagenResponseDTO;
  fotoDocumentoFrontal: ImagenResponseDTO;
  fotoDocumentoTrasero: ImagenResponseDTO;
  cliente: ClienteResponseDTO;
}