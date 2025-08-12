export interface ClienteDTO {
  uid: string,
  nombreCompleto: string,
  correoElectronico: string,
  fotoPerfil: {
    urlImagen: string
  }
}