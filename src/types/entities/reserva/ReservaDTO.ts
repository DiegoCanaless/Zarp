import type { FormaPago } from "../../enums/FormaPago";

export interface ReservaDTO {
  fechaInicio: Date;   // ISO date string, p.ej. "2024-07-30"
  fechaFin: Date;      // ISO date string
  precioTotal: number;
  clienteId: number;
  propiedadId: number ;
  formaPago: FormaPago;
}