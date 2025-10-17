import type { AutorizacionesCliente } from "../../enums/AutorizacionesCliente";
import type { Rol } from "../../enums/Rol";
import type { ImagenResponseDTO } from "../imagen/ImagenResponseDTO";

export interface ClienteResponseDTO {
  id: number;
  activo: boolean;
  uid: string;
  nombreCompleto: string;
  correoElectronico: string;
  rol: Rol;
  correoVerificado: boolean;
  documentoVerificado: boolean;
  fotoPerfil: ImagenResponseDTO | null;
  autorizaciones: AutorizacionesCliente;
}