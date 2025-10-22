import type { AutorizacionesCliente } from "../../enums/AutorizacionesCliente";
import type { Rol } from "../../enums/Rol";
import type { CredencialesMP } from "../credenciales/CredencialesMP";
import type { CredencialesPP } from "../credenciales/CredencialesPP";
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
  credencialesMP: CredencialesMP;
  credencialesPP: CredencialesPP;
}