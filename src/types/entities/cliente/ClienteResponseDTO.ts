import type { UsuarioResponseDTO } from "../usuario/UsuarioResponseDTO";

export interface ClienteResponseDTO {
  id: number;
  activo: boolean;
  usuario: UsuarioResponseDTO;
  telefono: string;
  correoVerificado: boolean;
  documentoVerificado: boolean;
}