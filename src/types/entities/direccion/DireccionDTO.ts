// DireccionDTO.ts
import { Provincia } from "../../enums/Provincia";

export type DireccionDTO = {
  calle: string;
  numero: string;
  piso: string;
  departamento: string;
  codigoPostal: string;
  localidad: string;
  provincia: Provincia;
  latitud: number;
  longitud: number;
};
