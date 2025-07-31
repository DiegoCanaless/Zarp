import type { Estado } from "../../enums/Estado";
import type { FormaPago } from "../../enums/FormaPago";
import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";
import type { PropiedadResponseDTO } from "../propiedad/PropiedadResponseDTO";

export interface ReservaResponseDTO {
  id: number;
  fechaInicio: string;   // ISO date string
  fechaFin: string;      // ISO date string
  precioTotal: number;
  cliente: ClienteResponseDTO;
  propiedad: PropiedadResponseDTO;
  estado: Estado;
  formaPago: FormaPago;
}