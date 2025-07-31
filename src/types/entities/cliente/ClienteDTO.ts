import type { UsuarioDTO } from "../usuario/UsuarioDTO";

export interface ClienteDTO {
  usuario: UsuarioDTO;
  telefono: string;
}