import type { Rol } from "../../enums/Rol";
import type { DireccionResponseDTO } from "../direccion/DireccionResponseDTO";
import type { UsuarioResponseDTO } from "../usuario/UsuarioResponseDTO";


export interface EmpleadoResponseDTO {
  id: number;
  activo: boolean;
  usuario: UsuarioResponseDTO;
  rol: Rol;
  direccion: DireccionResponseDTO;
  telefono: string;
}