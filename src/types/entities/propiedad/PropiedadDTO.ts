import type { DetalleAmbienteDTO } from "../detalleAmbiente/DetalleAmbienteDTO";
import type { DetalleCaracteristicaDTO } from "../detalleCaracteristica/DetalleCaracteristicaDTO";
import type { DetalleImagenDTO } from "../detalleImagen/DetalleImagenDTO";
import type { DetalleTipoPersonaDTO } from "../detalleTipoPersona/DetalleTipoPersonaDTO";
import type { DireccionDTO } from "../direccion/DireccionDTO";


export interface PropiedadDTO {
  nombre: string;
  descripcion: string;
  precioPorNoche: number;
  direccion: DireccionDTO;
  propietarioId: number;
  tipoPropiedadId: number;
  detalleTipoPersonas: DetalleTipoPersonaDTO[];
  detalleCaracteristicas: DetalleCaracteristicaDTO[];
  detalleImagenes: DetalleImagenDTO[];
  detalleAmbientes: DetalleAmbienteDTO[];
}
