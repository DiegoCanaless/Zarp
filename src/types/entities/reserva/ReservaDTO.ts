import type { FormaPago } from "../../enums/FormaPago";

export interface ReservaDTO {
  fechaInicio: string;   // ISO date string, p.ej. "2024-07-30"
  fechaFin: string;      // ISO date string
  precioTotal: number;
  clienteId: number;
  propiedadId: number;
  formaPago: FormaPago;
}