import type { Rol } from "../../enums/Rol";


export interface EmpleadoResponseDTO {
  id: number;
  activo: boolean;
  uid: string;
  nombreCompleto: string;
  correoElectronico: string;
  rol: Rol;
}