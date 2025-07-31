import type { TipoPersonaResponseDTO } from "../tipoPersona/TipoPersonaResponseDTO";

export interface DetalleTipoPersonaResponseDTO {
  id: number;
  cantidad: number;
  tipoPersona: TipoPersonaResponseDTO;
}