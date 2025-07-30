import type { ClienteResponseDTO } from "../cliente/ClienteResponseDTO";
import type { DetalleAmbienteResponseDTO } from "../detalleAmbiente/DetalleAmbienteResponseDTO";
import type { DetalleCaracteristicaResponseDTO } from "../detalleCaracteristica/DetalleCaracteristicaResponseDTO";
import type { DetalleImagenResponseDTO } from "../detalleImagen/DetalleImagenResponseDTO";
import type { DetalleTipoPersonaResponseDTO } from "../detalleTipoPersona/DetalleTipoPersonaResponseDTO";
import type { DireccionResponseDTO } from "../direccion/DireccionResponseDTO";
import type { ReseniaResponseDTO } from "../resenia/ReseniaResponseDTO";
import type { TipoPropiedadResponseDTO } from "../tipoPropiedad/TipoPropiedadResponseDTO";
import type { VerificacionPropiedad } from "../../enums/VerificacionPropiedad";

export interface PropiedadResponseDTO {
  id: number;
  activo: boolean;
  nombre: string;
  descripcion: string;
  propietario?: ClienteResponseDTO; // si decidís incluirlo
  precioPorNoche: number;
  verificacionPropiedad: VerificacionPropiedad;
  direccion: DireccionResponseDTO;
  tipoPropiedad: TipoPropiedadResponseDTO;
  resenias: ReseniaResponseDTO[];
  detalleTipoPersonas: DetalleTipoPersonaResponseDTO[];
  detalleCaracteristicas: DetalleCaracteristicaResponseDTO[];
  detalleImagenes: DetalleImagenResponseDTO[];
  detalleAmbientes: DetalleAmbienteResponseDTO[];
}