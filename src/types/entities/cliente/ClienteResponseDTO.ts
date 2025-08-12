import type { ImagenResponseDTO } from "../imagen/ImagenResponseDTO";

export interface ClienteResponseDTO {
  id: number;
  activo: boolean;
  uid: string;
  nombreCompleto: string;
  correoElectronico: string;
  rol: string | null;
  correoVerificado: boolean;
  documentoVerificado: boolean;
  fotoPerfil: ImagenResponseDTO | null;
}