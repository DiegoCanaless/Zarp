import type { EstadoPagosPendientes } from "../../enums/EstadoPagosPendietes";
import type { FormaPago } from "../../enums/FormaPago";
import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";

export interface PagoPendienteResponseDTO {
  id: number;
  activo: boolean;
  monto: number;
  propietario: ClienteResponseDTO;
  fechaCreacion: string; 
  formaPago: FormaPago;
  estadoPagosPendientes: EstadoPagosPendientes;
}
