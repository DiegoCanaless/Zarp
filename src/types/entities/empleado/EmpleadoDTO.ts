import type { Rol } from "../../enums/Rol";


export interface EmpleadoDTO {
  uid: string;
  nombreCompleto: string;
  correoElectronico: string;
  rol: Rol;
}