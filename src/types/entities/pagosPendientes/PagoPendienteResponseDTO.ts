import type { EstadoPagosPendientes } from "../../enums/EstadoPagosPendietes";
import type { FormaPago } from "../../enums/FormaPago";
import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";
import type { EmpleadoResponseDTO } from "../empleado/EmpleadoResponseDTO";

export interface PagoPendienteResponseDTO {
  id: number;
  empleado?: EmpleadoResponseDTO
  activo: boolean;
  monto: number;
  propietario: ClienteResponseDTO;
  fechaCreacion: string; 
  formaPago: FormaPago;
  estadoPagosPendientes: EstadoPagosPendientes;
}
