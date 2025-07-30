import type { Rol } from "../../enums/Rol";
import type { DireccionDTO } from "../direccion/DireccionDTO";
import type { UsuarioDTO } from "../usuario/UsuarioDTO";


export interface EmpleadoDTO {
  usuario: UsuarioDTO;
  direccion: DireccionDTO;
  rol: Rol;
  telefono: string;
}